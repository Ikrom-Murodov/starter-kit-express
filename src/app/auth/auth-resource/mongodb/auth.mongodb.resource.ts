import { injectable, inject } from 'inversify';

import {
  authRefreshTokenSchema,
  IAuthRefreshTokenDocument,
  IAuthRefreshTokenModel,
} from './schema/auth.schema';

import { IEnums, IModules, IServices, tokens, IUtils } from '../../../../container';

@injectable()
export default class AuthMongodbResource implements IModules.Auth.IAuthResource {
  private readonly Auth: IAuthRefreshTokenModel;

  constructor(
    @inject(tokens.services.MongooseConnectionServiceToken)
    private readonly mongooseConnectionService: IServices.MongooseConnection.IMongooseConnectionService,

    @inject(tokens.utils.objectFilteringToken)
    private readonly objectFilteringUtil: IUtils.IObjectFiltering,
  ) {
    this.Auth = this.mongooseConnectionService.connection.model<
      IAuthRefreshTokenDocument,
      IAuthRefreshTokenModel
    >('refreshToken', authRefreshTokenSchema);
  }

  public async deleteUserRefreshTokenByDeviceId(deviceId: IModules.Auth.TDeviceId) {
    const refreshTokenDocument = await this.Auth.findOneAndDelete({
      deviceId,
    });
    if (!refreshTokenDocument) return { success: false, data: null };
    return { success: true, data: null };
  }

  public async getUserRefreshToken(
    data: IModules.Auth.IParamsForGetUserRefreshTokenFromResource,
  ) {
    const refreshTokenDocument = await this.Auth.findOne(data);
    if (!refreshTokenDocument) return { success: false, data: null };

    return {
      success: true,
      data: this.objectFilteringUtil(refreshTokenDocument, [
        'userId',
        'refreshToken',
        'deviceId',
      ]),
    };
  }

  public async createUserRefreshToken(
    data: IModules.Auth.IParamsForCreateUserRefreshTokenFromResource,
  ) {
    await this.Auth.create(data);
    return { success: true, data: null };
  }
}
