import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordTokenPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Env } from '../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatToken,
  generateSecret,
  hashSecret,
  parseToken,
  secretMatches,
} from '../shared/utils/opaque-token.util';
import { BCRYPT_ROUNDS } from './consts/auth.consts';

const INVALID_LINK = 'This link is invalid or has expired';

/** Single-use "set your password" links (forgot password + invitations). */
@Injectable()
export class PasswordTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Issues a new link and invalidates the user's previous one of that kind. */
  async issue(userId: string, purpose: PasswordTokenPurpose): Promise<string> {
    await this.prisma.passwordToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });

    const secret = generateSecret();
    const record = await this.prisma.passwordToken.create({
      data: {
        userId,
        purpose,
        tokenHash: hashSecret(secret),
        expiresAt: new Date(Date.now() + this.ttlMs(purpose)),
      },
    });
    return formatToken(record.id, secret);
  }

  /**
   * Sets the new password, burns the link, and signs the user out
   * everywhere (an attacker who had a session loses it).
   */
  async consume(rawToken: string, newPassword: string): Promise<void> {
    const parsed = parseToken(rawToken);
    if (!parsed) throw new BadRequestException(INVALID_LINK);

    const record = await this.prisma.passwordToken.findUnique({
      where: { id: parsed.id },
    });
    if (
      !record ||
      !secretMatches(parsed.secret, record.tokenHash) ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      throw new BadRequestException(INVALID_LINK);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction(async (tx) => {
      // Conditional update: two concurrent submissions can't both succeed.
      const { count } = await tx.passwordToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (count === 0) throw new BadRequestException(INVALID_LINK);

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  }

  ttlMinutes(purpose: PasswordTokenPurpose): number {
    return this.ttlMs(purpose) / 60_000;
  }

  private ttlMs(purpose: PasswordTokenPurpose): number {
    return purpose === PasswordTokenPurpose.RESET
      ? this.config.get('PASSWORD_RESET_TTL_MINUTES', { infer: true }) * 60_000
      : this.config.get('INVITE_TTL_HOURS', { infer: true }) * 3_600_000;
  }
}
