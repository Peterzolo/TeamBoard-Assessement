import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { User, UserDocument } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument, User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findUserForLogin(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findUserWithEmailVerificationToken(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+emailVerificationToken')
      .exec();
  }

  async updateEmailVerificationToken(
    email: string,
    emailVerificationToken: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ email }, { emailVerificationToken }, { new: true })
      .select('+emailVerificationToken')
      .exec();
  }

  async findUserByIdWithResetToken(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+passwordResetToken +passwordResetExpires')
      .exec();
  }
}
