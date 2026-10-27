import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Env } from '../config/env.validation';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { JwtPayload } from './types/jwt-payload.type';
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from './utils/cookies.util';

/** Brute-force protection for credential endpoints. */
const STRICT_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('register-organization')
  @ApiOperation({ summary: 'Create an organization and its first admin' })
  async registerOrganization(
    @Body() dto: RegisterOrganizationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.registerOrganization(dto);
    setAuthCookies(res, session, this.config);
    return session.user;
  }

  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Customer signup (pending admin approval)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.login(dto);
    setAuthCookies(res, session, this.config);
    return session.user;
  }

  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email a password reset link' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a password from a reset or invitation link' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const session = await this.authService.refresh(
        req.cookies?.[REFRESH_COOKIE] as string | undefined,
      );
      setAuthCookies(res, session, this.config);
      return session.user;
    } catch (error) {
      clearAuthCookies(res, this.config);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(
      req.cookies?.[REFRESH_COOKIE] as string | undefined,
    );
    clearAuthCookies(res, this.config);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}
