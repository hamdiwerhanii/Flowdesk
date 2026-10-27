import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { JwtPayload } from '../types/jwt-payload.type';
import { ACCESS_COOKIE } from '../utils/cookies.util';

/** Global guard: every route needs a valid access token unless @Public(). */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing access token');

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    return true;
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const fromCookie = request.cookies?.[ACCESS_COOKIE] as string | undefined;
    if (fromCookie) return fromCookie;
    const [type, value] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? value : undefined;
  }
}
