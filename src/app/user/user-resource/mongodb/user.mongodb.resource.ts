import { injectable, inject } from 'inversify';
import mongoose from 'mongoose';

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

  public async createUserViaOauth(
    userData: IModules.User.IParamsForCreateUserViaOauthFromResource,
  ) {
    const userDocument = await this.Users.create(userData);
    const user = this.getPublicUserDataFromDocument(userDocument);
    return { success: true, data: user };
  }

  public async createUser(userData: IModules.User.IParamsForCreateUserFromResource) {
    const userDocument = await this.Users.create(userData);
    const user = this.getPublicUserDataFromDocument(userDocument);
    return { success: true, data: user };
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

  public async getCompleteUserDataById(id: IModules.User.IUser['id']) {
    if (!this.checkUserIdForValidity(id)) return { success: false, data: null };
    const userDocument = await this.Users.findById(id);
    if (!userDocument) return { success: false, data: null };

    const userData = this.getCompleteUserDataFromDocument(userDocument);
    return { success: true, data: userData };
  }

  public async updatePrivateUserDataById(
    userData: IModules.User.IParamsForUpdatePrivateUserDataByIdFromService,
  ) {
    if (!this.checkUserIdForValidity(userData.id)) return { success: false, data: null };
    const userDocument = await this.Users.findByIdAndUpdate(userData.id, userData.update);
    if (!userDocument) return { success: false, data: null };
    return { success: true, data: userDocument };
  }

  private checkUserIdForValidity(id: any): boolean {
    return mongoose.Types.ObjectId.isValid(id);
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

  private getCompleteUserDataFromDocument(
    userDocument: IUserDocument,
  ): IModules.User.IUser {
    return this.objectFilteringUtil(userDocument, [
      'name',
      'surname',
      'age',
      'email',
      'emailVerifyToken',
      'registerType',
      'passwordHash',
      'salt',
      'passwordResetToken',
      'id',
      'verifiedEmail',
    ]);
  }
}
