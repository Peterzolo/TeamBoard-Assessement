import { IsEmail, IsEnum, IsBoolean, IsDefined } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class BaseUserSignUpDto {
  @IsEmail()
  email: string;

  @IsDefined()
  @Transform(({ value }) => {
    if (!value) return value;
    const val = String(value);
    // If already a valid enum value, keep
    if (Object.values(UserRole).includes(val as UserRole)) return val;
    // Normalize common variants
    const normalized = val
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');
    const map: Record<string, UserRole> = {
      SUPER_ADMIN: UserRole.SUPER_ADMIN,
      ADMIN: UserRole.ADMIN,
      PROJECT_MANAGER: UserRole.PROJECT_MANAGER,
      TEAM_MEMBER: UserRole.TEAM_MEMBER,
    };
    return map[normalized] ?? val;
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class InviteUserDto extends BaseUserSignUpDto {}
