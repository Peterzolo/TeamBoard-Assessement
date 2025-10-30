import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TokenExtractorService {
  extractAccessTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  extractRefreshTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.refresh_token;
  }

  extractAccessTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }

  extractTokensFromResponse(response: any): {
    accessToken?: string;
    refreshToken?: string;
  } {
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  }

  parseCookieString(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (!cookieString) return cookies;

    cookieString.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });

    return cookies;
  }
}
