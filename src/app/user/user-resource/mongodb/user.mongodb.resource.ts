import { injectable, inject } from 'inversify';

import { tokens, IServices, IEnums, IModules, IUtils } from '../../../../container';

import { IUserDocument, IUserModel, userSchema } from './schema/user.schema';

@injectable()
export default class UserMongodbResource implements IModules.User.IUserResource {
  private readonly Users: IUserModel;

  constructor(
    @inject(tokens.services.MongooseConnectionServiceToken)
    private readonly mongooseConnectionService: IServices.MongooseConnection.IMongooseConnectionService,

    @inject(tokens.utils.objectFilteringToken)
    private readonly objectFilteringUtil: IUtils.IObjectFiltering,
  ) {
    this.Users = this.mongooseConnectionService.connection.model<
      IUserDocument,
      IUserModel
    >('user', userSchema);
  }

  public async findUsersByParams(
    params: IModules.User.IParamsForFindUsersByParamsFromResource,
  ) {
    const usersDocuments = await this.Users.find(params.find).limit(params.limit);

    const users = usersDocuments.map((userDocument) => {
      return this.getPublicUserDataFromDocument(userDocument);
    });

    if (users.length) return { success: true, data: users };
    return { success: false, data: null };
  }

  private getPublicUserDataFromDocument(
    userDocument: IUserDocument,
  ): IModules.User.IPublicUserData {
    return this.objectFilteringUtil(userDocument, [
      'name',
      'surname',
      'age',
      'email',
      'id',
      'verifiedEmail',
    ]);
  }
}
