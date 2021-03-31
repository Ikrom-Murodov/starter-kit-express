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
  find: {
    name?: IUser['name'];
    surname?: IUser['surname'];
    age?: IUser['age'];
    email?: IUser['email'];
    emailVerifyToken?: IUser['emailVerifyToken'];
    id?: IUser['id'];
    verifiedEmail?: IUser['verifiedEmail'];
  };
  limit: number;
}

export interface IParamsForCreateUserFromService extends IBaseUser {
  password: TUserPassword;
}

export interface IParamsForCheckUserPasswordFromService {
  id: IUser['id'];
  password: TUserPassword;
}

export interface IUserService {
  readonly checkPassword: (
    userData: IParamsForCheckUserPasswordFromService,
  ) => Promise<IServices.Response.IResponseFromService<null>>;

  readonly findUsersByParams: (
    params: IParamsForFindUsersByParamsFromService,
  ) => Promise<IServices.Response.IResponseFromService<IPublicUserData[] | null>>;

  readonly createUser: (
    userData: IParamsForCreateUserFromService,
  ) => Promise<IServices.Response.IResponseFromService<IPublicUserData | null>>;

  readonly generateSaltAndPasswordHash: (
    password: TUserPassword,
    salt?: IUser['salt'],
  ) => Promise<{ salt: IUser['salt']; passwordHash: IUser['passwordHash'] }>;
}

export interface IParamsForFindUsersByParamsFromResource
  extends IParamsForFindUsersByParamsFromService {}

export type IParamsForCreateUserFromResource = Omit<IUser, 'id'>;

export interface IUserResource {
  readonly createUser: (
    userData: IParamsForCreateUserFromResource,
  ) => Promise<IServices.Response.IResponseFromResource<IPublicUserData>>;

  readonly findUsersByParams: (
    params: IParamsForFindUsersByParamsFromResource,
  ) => Promise<IServices.Response.IResponseFromResource<IPublicUserData[] | null>>;

  readonly getCompleteUserDataById: (
    userId: IUser['id'],
  ) => Promise<IServices.Response.IResponseFromResource<IUser | null>>;
}
