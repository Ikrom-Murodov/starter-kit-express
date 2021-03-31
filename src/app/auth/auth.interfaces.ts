import { IModules, IServices } from '../../container';

export interface IParamsForRegisterUserFromService
  extends IModules.User.IParamsForCreateUserFromService {}

export interface IAuthService {
  readonly register: (
    userData: IParamsForRegisterUserFromService,
  ) => Promise<
    IServices.Response.IResponseFromService<IModules.User.IPublicUserData | null>
  >;
}

export interface IAuthResource {}
