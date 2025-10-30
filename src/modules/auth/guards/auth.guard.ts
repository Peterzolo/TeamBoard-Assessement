import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Optional,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string; // add role
  type: 'access';
}

@Injectable()
export class AuthGuard implements CanActivate {
  // Debugging line
  constructor(
    private readonly jwtService: JwtService,
    @Optional()
    @Inject('IUserLookupService')
    private readonly userLookupService?: IUserLookupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    console.log('Extracted token:', token); // Debugging line

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // If userLookupService is available, fetch the full user document
      if (this.userLookupService) {
        try {
          const fullUser = await this.userLookupService.findUserById(payload.sub);
          if (!fullUser) {
            throw new UnauthorizedException('User not found');
          }
          // Attach full user info to request for use in controllers
          request['user'] = fullUser;
        } catch (error) {
          // If user fetch fails, fall back to basic user info
          console.warn('Failed to fetch full user, using basic info:', error.message);
          request['user'] = {
            _id: payload.sub,
            email: payload.email,
            role: payload.role,
          };
        }
      } else {
        // Fallback to basic user info when userLookupService is not available
        request['user'] = {
          _id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
      }

      return true;
    } catch (error: unknown) {
      console.error('JWT Verification Error:', error);

      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token format');
        } else if (error.name === 'NotBeforeError') {
          throw new UnauthorizedException('Token not yet valid');
        }
      }

      throw new UnauthorizedException('Invalid access token');
    }
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
