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

  public async createUserRefreshToken(
    data: IModules.Auth.IParamsForCreateUserRefreshTokenFromResource,
  ) {
    await this.Auth.create(data);
    return { success: true, data: null };
  }
}
