import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, UserDocument } from '../../users/entities/user.entity';

export interface CurrentUser extends UserDocument {
  _id: string;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
    const user = request.user;
    if (!user) return undefined;
    if (typeof data === 'string' && (user as any)[data] !== undefined) {
      return (user as any)[data];
    }
    return user;
  },
);
