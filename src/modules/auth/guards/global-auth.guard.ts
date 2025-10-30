import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string; // add role
  type: 'access';
}

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Log the incoming request
    console.log('🟡 [GLOBAL_AUTH] Request received:', {
      method: request.method,
      url: request.url,
      path: request.path,
      headers: {
        'content-type': request.headers['content-type'],
        authorization: request.headers.authorization ? 'present' : 'missing',
        'user-agent': request.headers['user-agent'],
      },
    });

    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🟡 [GLOBAL_AUTH] Route analysis:', {
      isPublic,
      handler: context.getHandler().name,
      className: context.getClass().name,
    });

    if (isPublic) {
      console.log('🟡 [GLOBAL_AUTH] Route is public, allowing access');
      return true;
    }

    console.log(
      '🟡 [GLOBAL_AUTH] Route requires authentication, checking token...',
    );
    const token = this.extractTokenFromRequest(request);

    console.log('🟡 [GLOBAL_AUTH] Token extraction result:', {
      hasToken: !!token,
      tokenType: typeof token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    if (!token) {
      console.error('🔴 [GLOBAL_AUTH] No token found in request');
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      console.log('🟡 [GLOBAL_AUTH] Token verification successful:', {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        type: payload.type,
      });

      if (payload.type !== 'access') {
        console.error('🔴 [GLOBAL_AUTH] Invalid token type:', payload.type);
        throw new UnauthorizedException('Invalid token type');
      }

      // Attach user info to request for use in controllers
      (
        request as Request & {
          user: { _id: string; email: string; role: string };
        }
      ).user = {
        _id: payload.sub,
        email: payload.email,
        role: payload.role, // attach role
      };
      console.log(
        '🟡 [GLOBAL_AUTH] User attached to request:',
        request['user'],
      );

      return true;
    } catch (error: unknown) {
      console.error('🔴 [GLOBAL_AUTH] Token verification failed:', error);

      // Check if it's a JWT expiration error
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        // Clear cookies on token expiration
        this.clearAuthCookies(response);
        throw new UnauthorizedException('Token expired. Please log in again.');
      }

      // For other JWT errors (invalid signature, malformed, etc.)
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        this.clearAuthCookies(response);
        throw new UnauthorizedException('Invalid access token');
      }

      // For any other unexpected errors
      this.clearAuthCookies(response);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private clearAuthCookies(response: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // First try to get token from Authorization header
    const headerToken = this.extractTokenFromHeader(request);
    if (headerToken) {
      return headerToken;
    }

    // Fallback to cookies
    return request.cookies?.access_token;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
