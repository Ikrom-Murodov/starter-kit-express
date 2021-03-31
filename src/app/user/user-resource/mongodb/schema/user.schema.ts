import mongoose, { Document, Model } from 'mongoose';

import { IUser } from '../../../user.interfaces';

// @ts-ignore
interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>({
  name: { type: String },
  surname: { type: String },
  age: { type: Number },
  email: { type: String },
  passwordHash: { type: String },
  salt: { type: String },
  verifiedEmail: { type: Boolean },
  emailVerifyToken: { type: String },
  passwordResetToken: { type: String },
  registerType: { type: String },
});

export { userSchema, IUserDocument, IUserModel };
