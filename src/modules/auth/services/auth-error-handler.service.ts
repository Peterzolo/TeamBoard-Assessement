import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

export interface AuthErrorResponse {
  message: string;
  code: string;
  shouldLogout: boolean;
}

@Injectable()
export class AuthErrorHandlerService {
  /**
   * Handle JWT token errors and return appropriate error responses
   */
  handleTokenError(error: unknown, response?: Response): AuthErrorResponse {
    if (error instanceof Error) {
      switch (error.name) {
        case 'TokenExpiredError':
          if (response) {
            this.clearAuthCookies(response);
          }
          return {
            message: 'Token expired. Please log in again.',
            code: 'TOKEN_EXPIRED',
            shouldLogout: true,
          };

        case 'JsonWebTokenError':
          if (response) {
            this.clearAuthCookies(response);
          }
          return {
            message: 'Invalid access token',
            code: 'INVALID_TOKEN',
            shouldLogout: true,
          };

        case 'NotBeforeError':
          if (response) {
            this.clearAuthCookies(response);
          }
          return {
            message: 'Token not yet valid',
            code: 'TOKEN_NOT_VALID',
            shouldLogout: true,
          };

        default:
          if (response) {
            this.clearAuthCookies(response);
          }
          return {
            message: 'Authentication failed',
            code: 'AUTH_FAILED',
            shouldLogout: true,
          };
      }
    }

    // For unknown errors
    if (response) {
      this.clearAuthCookies(response);
    }
    return {
      message: 'Authentication failed',
      code: 'UNKNOWN_ERROR',
      shouldLogout: true,
    };
  }

  /**
   * Handle refresh token errors
   */
  handleRefreshTokenError(
    error: unknown,
    response?: Response,
  ): AuthErrorResponse {
    if (response) {
      this.clearAuthCookies(response);
    }

    if (error instanceof Error) {
      switch (error.name) {
        case 'TokenExpiredError':
          return {
            message: 'Session expired. Please log in again.',
            code: 'REFRESH_TOKEN_EXPIRED',
            shouldLogout: true,
          };

        case 'JsonWebTokenError':
          return {
            message: 'Invalid refresh token',
            code: 'INVALID_REFRESH_TOKEN',
            shouldLogout: true,
          };

        default:
          return {
            message: 'Session expired. Please log in again.',
            code: 'REFRESH_FAILED',
            shouldLogout: true,
          };
      }
    }

    return {
      message: 'Session expired. Please log in again.',
      code: 'REFRESH_FAILED',
      shouldLogout: true,
    };
  }

  /**
   * Clear authentication cookies
   */
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

  /**
   * Throw appropriate UnauthorizedException based on error type
   */
  throwAuthException(error: unknown, response?: Response): never {
    const errorResponse = this.handleTokenError(error, response);
    throw new UnauthorizedException({
      message: errorResponse.message,
      code: errorResponse.code,
      shouldLogout: errorResponse.shouldLogout,
    });
  }

  /**
   * Throw refresh token exception
   */
  throwRefreshException(error: unknown, response?: Response): never {
    const errorResponse = this.handleRefreshTokenError(error, response);
    throw new UnauthorizedException({
      message: errorResponse.message,
      code: errorResponse.code,
      shouldLogout: errorResponse.shouldLogout,
    });
  }
}
