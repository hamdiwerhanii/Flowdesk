import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { RoleGuard } from './guards/role.guard';
import { PasswordTokenService } from './password-token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordTokenService,
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
  exports: [AuthService, PasswordTokenService],
})
export class AuthModule {}
