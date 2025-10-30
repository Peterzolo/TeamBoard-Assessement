import { IsEmail, IsEnum, IsBoolean, IsDefined } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class BaseUserSignUpDto {
  @IsEmail()
  email: string;

  @IsDefined()
  @IsEnum(UserRole)
  role: UserRole;
}

export class InviteUserDto extends BaseUserSignUpDto {}
