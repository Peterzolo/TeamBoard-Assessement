import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthEmailService } from './auth-email.service';
import { LoginDto } from '../dto/login.dto';
import { UserDocument } from '../../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { addMinutes } from 'date-fns';

interface EmailVerificationPayload {
  email: string;
}

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string; // include role
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: string; // include role
  type: 'refresh';
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserLookupService')
    private readonly userLookupService: IUserLookupService,
    private readonly jwtService: JwtService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  private generateAccessToken(user: UserDocument): string {
    const payload: AccessTokenPayload = {
      sub: user._id?.toString() || user.id?.toString(),
      email: user.email,
      role: user.role, // include role
      type: 'access',
    };

    const token = this.jwtService.sign(payload, { expiresIn: '24h' }); // 24 hours

    // Debug: Decode and log token info
    try {
      const decoded = this.jwtService.decode(token);
      console.log('Generated Access Token Info:', {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type,
        iat: new Date(decoded.iat * 1000),
        exp: new Date(decoded.exp * 1000),
        expiresIn: '24h',
      });
    } catch (error) {
      console.error('Error decoding token for debug:', error);
    }

    return token;
  }

  private generateRefreshToken(user: UserDocument): string {
    const payload: RefreshTokenPayload = {
      sub: user._id?.toString() || user.id?.toString(),
      email: user.email,
      role: user.role, // include role
      type: 'refresh',
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // 7 days
  }

  private generateTokenPair(user: UserDocument): TokenResponse {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  // Refactored verifyEmail: Only sets isEmailVerified, does not require full profile
  async verifyEmail(token: string): Promise<{ message: string }> {
    const decoded = await this.jwtService
      .verifyAsync<{ email: string }>(token)
      .catch((_error: unknown) => {
        throw new UnauthorizedException('Invalid verification token');
      });
    const user =
      await this.userLookupService.findUserWithEmailVerificationToken(
        decoded.email,
      );
    if (!user || user.emailVerificationToken !== token) {
      throw new UnauthorizedException('Invalid verification token');
    }
    user.isEmailVerified = true;
    // user.emailVerificationToken = null;
    await user.save();
    return { message: 'Email verified. Please complete your profile.' };
  }

  // Refactored login: Only allow if profile is complete and isEmailVerified is true
  async login(loginDto: LoginDto): Promise<{
    user: UserDocument;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userLookupService.findUserForLogin(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }
    if (!user.firstName || !user.lastName) {
      throw new ForbiddenException(
        'Please complete your profile before logging in',
      );
    }
    const tokens = this.generateTokenPair(user);
    return { user, ...tokens };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user =
      await this.userLookupService.findUserWithEmailVerificationToken(email);

    if (!user) {
      throw new ConflictException('User not found');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Email is already verified');
    }

    const emailVerificationToken = this.jwtService.sign({
      email: user.email,
    });

    const updatedUser =
      await this.userLookupService.updateEmailVerificationToken(
        email,
        emailVerificationToken,
      );

    if (!updatedUser) {
      throw new ConflictException('Failed to update verification token');
    }

    const verificationLink = `http://localhost:3000/screens/auth/verify-email?token=${emailVerificationToken}`;
    await this.authEmailService.sendEmailVerificationLink(
      updatedUser.email,
      verificationLink,
    );

    return {
      message: 'Verification email resent. Please check your inbox.',
    };
  }

  async getCurrentUser(_id: string): Promise<UserDocument> {
    const user = await this.userLookupService.getCurrentUser(_id);
    console.log('Current user found:', user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
  // console.log('Current user found:', user);
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userLookupService.findUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isEmailVerified) {
        throw new ForbiddenException('User email not verified');
      }

      return this.generateTokenPair(user);
    } catch (error: unknown) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; token?: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userLookupService.findUserByEmail(email);
    if (!user) {
      // Do not reveal if user exists
      return {
        message: 'If that email is registered, a reset link has been sent.',
      };
    }

    const payload = { sub: user._id?.toString() || user.id?.toString(), email: user.email, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });
    user.passwordResetToken = token;

    user.passwordResetExpires = addMinutes(new Date(), 60); // 1 hour
    await user.save();
    const resetLink = `http://localhost:3000/screens/auth/reset-password?token=${token}`;
    await this.authEmailService.sendPasswordResetLink(user.email, resetLink);
    return {
      message: 'If that email is registered, a reset link has been sent.',
      token,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.userLookupService.findUserByIdWithResetToken(
      payload.sub,
    );
    console.log('User found for password reset:', user);

    if (
      !user ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    return { message: 'Password has been reset successfully.' };
  }
}
