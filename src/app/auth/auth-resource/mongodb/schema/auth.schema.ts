import mongoose, { Document, Model } from 'mongoose';

import { IAuthRefreshToken } from '../../../auth.interfaces';

interface IAuthRefreshTokenDocument extends IAuthRefreshToken, Document {}

interface IAuthRefreshTokenModel extends Model<IAuthRefreshTokenDocument> {}

const authRefreshTokenSchema = new mongoose.Schema<IAuthRefreshTokenDocument>({
  userId: String,
  refreshToken: String,
  deviceId: String,
});

export { authRefreshTokenSchema, IAuthRefreshTokenDocument, IAuthRefreshTokenModel };
