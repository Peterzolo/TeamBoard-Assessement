import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';

interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: string;
      email: string;
    };
  }
}

@Injectable()
export class AutoRefreshMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    if (!accessToken) return next(); // no access token, continue unauthenticated

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);

      req.user = {
        _id: payload.sub,
        email: payload.email,
      };

      console.log('User from access token: REFRESH MIDDLEWARE', req.user);

      return next();
    } catch (error) {
      // Check if it's specifically a token expiration error
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        console.log('Access token expired, attempting refresh...');

        if (refreshToken) {
          try {
            const newTokens = await this.authService.refreshToken(refreshToken);
            const newPayload =
              await this.jwtService.verifyAsync<AccessTokenPayload>(
                newTokens.accessToken,
              );

            // Set refreshed tokens
            this.setAuthCookies(
              res,
              newTokens.accessToken,
              newTokens.refreshToken,
            );

            // Attach user info
            req.user = {
              _id: newPayload.sub,
              email: newPayload.email,
            };

            console.log('Tokens refreshed successfully');
            return next();
          } catch (refreshError) {
            console.log('Refresh token also expired or invalid');
            this.clearAuthCookies(res);
            throw new UnauthorizedException(
              'Session expired. Please log in again.',
            );
          }
        } else {
          console.log('No refresh token available');
          this.clearAuthCookies(res);
          throw new UnauthorizedException(
            'Access token expired. Please log in again.',
          );
        }
      } else {
        // For other JWT errors (invalid signature, malformed, etc.)
        console.log(
          'Invalid access token:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        this.clearAuthCookies(res);
        throw new UnauthorizedException('Invalid access token');
      }
    }
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15, // 15 min
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  private clearAuthCookies(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }
}
