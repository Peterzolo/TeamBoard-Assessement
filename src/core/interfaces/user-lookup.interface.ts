import { UserDocument } from '../../modules/users/entities/user.entity';

/**
 * Interface for user lookup operations
 * This allows Auth module to query users without direct dependency on UsersService
 * In microservices architecture, this can be implemented as HTTP client
 */
export interface IUserLookupService {
  /**
   * Find a user by email for login purposes (includes password)
   */
  findUserForLogin(email: string): Promise<UserDocument | null>;

  /**
   * Find a user by email with email verification token
   */
  findUserWithEmailVerificationToken(
    email: string,
  ): Promise<UserDocument | null>;

  /**
   * Find a user by ID with password reset token
   */
  findUserByIdWithResetToken(id: string): Promise<UserDocument | null>;

  /**
   * Find a user by ID
   */
  findUserById(id: string): Promise<UserDocument | null>;

  /**
   * Find a user by email
   */
  findUserByEmail(email: string): Promise<UserDocument | null>;

  /**
   * Update email verification token for a user
   */
  updateEmailVerificationToken(
    email: string,
    token: string,
  ): Promise<UserDocument | null>;

  /**
   * Get current user by ID (for auth guards)
   */
  getCurrentUser(id: string): Promise<UserDocument | null>;

  /**
   * Find users by roles (for notifications and bulk operations)
   */
  findUsersByRole(roles: string[]): Promise<UserDocument[]>;

  /**
   * Get user email by ID
   */
  getUserEmailById(id: string): Promise<string | null>;
}
