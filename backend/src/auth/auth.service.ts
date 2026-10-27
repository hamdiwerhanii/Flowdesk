import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MembershipStatus, PasswordTokenPurpose, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Env } from '../config/env.validation';
import { MailService } from '../mail/mail.service';
import { passwordLink } from '../mail/utils/app-links.util';
import { PrismaService } from '../prisma/prisma.service';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import {
  BCRYPT_ROUNDS,
  REFRESH_REUSE_GRACE_MS,
  RESERVED_SLUGS,
} from './consts/auth.consts';
import {
  formatToken,
  generateSecret,
  hashSecret,
  parseToken,
  secretMatches,
} from '../shared/utils/opaque-token.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordTokenService } from './password-token.service';
import type { JwtPayload } from './types/jwt-payload.type';
import type { SessionTokens } from './utils/cookies.util';

const FORGOT_PASSWORD_MESSAGE =
  'If an account exists for this email, we sent a link to reset the password.';

export type AuthUser = Awaited<ReturnType<AuthService['me']>>;
export type Session = SessionTokens & { user: AuthUser };

const DUMMY_HASH = bcrypt.hashSync('flowdesk-timing-guard', BCRYPT_ROUNDS);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly gateway: WebsocketGateway,
    private readonly mail: MailService,
    private readonly passwordTokens: PasswordTokenService,
  ) {}

  async registerOrganization(dto: RegisterOrganizationDto): Promise<Session> {
    if (RESERVED_SLUGS.has(dto.slug)) {
      throw new BadRequestException('This slug is reserved');
    }
    const [emailTaken, slugTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.organization.findUnique({ where: { slug: dto.slug } }),
    ]);
    if (emailTaken) throw new ConflictException('Email already registered');
    if (slugTaken) throw new ConflictException('Slug already taken');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.organizationName, slug: dto.slug },
      });
      return tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
          memberships: {
            create: {
              organizationId: organization.id,
              role: Role.ADMIN,
              status: MembershipStatus.ACTIVE,
            },
          },
        },
      });
    });
    return this.issueSession(user.id);
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug: dto.orgSlug },
    });
    if (!organization) throw new NotFoundException('Organization not found');

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        'Email already registered. Ask an admin of this organization to add you.',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        memberships: {
          create: {
            organizationId: organization.id,
            role: Role.CUSTOMER,
            status: MembershipStatus.PENDING,
          },
        },
      },
      include: { memberships: true },
    });

    this.gateway.emitToOrgAdmins(
      organization.id,
      SocketEvent.ACCOUNT_REQUEST_CREATED,
      { orgId: organization.id, membershipId: user.memberships[0].id },
    );
    const admins = await this.prisma.membership.findMany({
      where: {
        organizationId: organization.id,
        role: Role.ADMIN,
        status: MembershipStatus.ACTIVE,
      },
      select: { user: { select: { name: true, email: true } } },
    });
    for (const { user: admin } of admins) {
      this.mail.sendAccountRequest(
        admin,
        user,
        organization.name,
        organization.slug,
      );
    }
    return {
      message:
        'Account created. An admin must approve it before you can log in.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      const token = await this.passwordTokens.issue(
        user.id,
        PasswordTokenPurpose.RESET,
      );
      this.mail.sendPasswordReset(
        user,
        passwordLink(this.config.get('APP_URL', { infer: true }), token),
        this.passwordTokens.ttlMinutes(PasswordTokenPurpose.RESET),
      );
    }
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.passwordTokens.consume(dto.token, dto.password);
    return { message: 'Your password was saved. You can log in now.' };
  }

  async login(dto: LoginDto): Promise<Session> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { memberships: { select: { status: true } } },
    });
    const passwordOk = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const statuses = user.memberships.map((m) => m.status);
    if (!statuses.includes(MembershipStatus.ACTIVE)) {
      throw statuses.includes(MembershipStatus.PENDING)
        ? new ForbiddenException({
            message: 'Your account is awaiting approval',
            code: 'ACCOUNT_PENDING',
          })
        : new ForbiddenException({
            message: 'You are not a member of any organization',
            code: 'NO_ORGANIZATION',
          });
    }
    return this.issueSession(user.id);
  }

  async refresh(rawToken: string | undefined): Promise<Session> {
    const parsed = parseToken(rawToken);
    if (!parsed) throw new UnauthorizedException('Missing refresh token');

    const record = await this.prisma.refreshToken.findUnique({
      where: { id: parsed.id },
    });
    if (!record || !secretMatches(parsed.secret, record.tokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (record.revokedAt) {
      const age = Date.now() - record.revokedAt.getTime();
      if (age > REFRESH_REUSE_GRACE_MS) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: record.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Session revoked');
      }
    } else {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
    }
    return this.issueSession(record.userId);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    const parsed = parseToken(rawToken);
    if (!parsed) return;
    await this.prisma.refreshToken.updateMany({
      where: { id: parsed.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          select: {
            id: true,
            role: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { organization: { name: 'asc' } },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }

  private async issueSession(userId: string): Promise<Session> {
    const user = await this.me(userId);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.memberships.map((m) => ({
        orgId: m.organization.id,
        orgSlug: m.organization.slug,
        orgName: m.organization.name,
        role: m.role,
      })),
    };

    const secret = generateSecret();
    const ttlDays = this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true });
    const record = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashSecret(secret),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: formatToken(record.id, secret),
      user,
    };
  }
}
