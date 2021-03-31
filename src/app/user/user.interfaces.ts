// eslint-disable-next-line import/no-extraneous-dependencies
import { PartialDeep } from 'type-fest';
import { IServices } from '../../container';

export type TUserPassword = string;

export interface IBaseUser {
  name: string;
  surname: string;
  age: number;
  email: string;
}

export interface IUser extends IBaseUser {
  id: string;
  salt: string;
  passwordHash: string;
  verifiedEmail: boolean;
  emailVerifyToken: string | null;
  passwordResetToken: string | null;
  registerType: 'base' | 'oauth';
}

export interface IPublicUserData extends IBaseUser {
  id: IUser['id'];
  verifiedEmail: IUser['verifiedEmail'];
}

export interface IParamsForFindUsersByParamsFromService {
  find: PartialDeep<IPublicUserData>;
  limit: number;
}

export interface IUserService {
  readonly findUsersByParams: (
    params: IParamsForFindUsersByParamsFromService,
  ) => Promise<IServices.Response.IResponseFromService<IPublicUserData[] | null>>;
}

export interface IParamsForFindUsersByParamsFromResource
  extends IParamsForFindUsersByParamsFromService {}

export interface IUserResource {
  readonly findUsersByParams: (
    params: IParamsForFindUsersByParamsFromResource,
  ) => Promise<IServices.Response.IResponseFromResource<IPublicUserData[] | null>>;
}
