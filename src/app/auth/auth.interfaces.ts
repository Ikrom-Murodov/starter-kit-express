import { IModules, IServices } from '../../container';

export type TAccessToken = string;
export type TRefreshToken = string;
export type TDeviceId = string;

export interface IAuthPairToken {
  accessToken: TAccessToken;
  refreshToken: TRefreshToken;
}

export interface IAuthRefreshToken {
  userId: IModules.User.IUser['id'];
  refreshToken: TRefreshToken;
  deviceId: TDeviceId;
}

export interface IParamsForRegisterUserFromService
  extends IModules.User.IParamsForCreateUserFromService {}

export interface IParamsForLoginUserFromService {
  email: IModules.User.IUser['email'];
  password: IModules.User.TUserPassword;
  deviceId: TDeviceId;
}

export interface IParamsForRefreshTokenUserFromService {
  refreshToken: TRefreshToken;
  deviceId: TDeviceId;
}

export interface IParamsForLoginUserViaOauthFromService {
  deviceId: TDeviceId;
  type: IServices.Oauth.TTypeOauthLogin;
  code: IServices.Oauth.TCode;
}

export interface IParamsForGeneratePasswordResetTokenFromSErvice {
  email: IModules.User.IUser['email'];
}

export interface IAuthService {
  readonly generatePasswordResetToken: (
    userData: IParamsForGeneratePasswordResetTokenFromSErvice,
  ) => Promise<IServices.Response.IResponseFromService<null>>;

  readonly loginViaOauth: (
    userData: IParamsForLoginUserViaOauthFromService,
  ) => Promise<IServices.Response.IResponseFromService<IAuthPairToken | null>>;

  readonly isAuthenticated: (
    accessToken: TAccessToken,
  ) => Promise<IServices.Response.IResponseFromService>;

  readonly register: (
    userData: IParamsForRegisterUserFromService,
  ) => Promise<
    IServices.Response.IResponseFromService<IModules.User.IPublicUserData | null>
  >;

  readonly login: (
    userData: IParamsForLoginUserFromService,
  ) => Promise<IServices.Response.IResponseFromService<IAuthPairToken | null>>;

  readonly verifyEmail: (
    emailVerifyToken: IModules.User.TEmailVerifyToken,
  ) => Promise<IServices.Response.IResponseFromService>;

  readonly refreshToken: (
    userData: IParamsForRefreshTokenUserFromService,
  ) => Promise<IServices.Response.IResponseFromService<IAuthPairToken | null>>;
}

export interface IParamsForCreateUserRefreshTokenFromResource extends IAuthRefreshToken {}

export interface IParamsForGetUserRefreshTokenFromResource {
  refreshToken: TRefreshToken;
  deviceId: TDeviceId;
}

export interface IAuthResource {
  readonly createUserRefreshToken: (
    data: IParamsForCreateUserRefreshTokenFromResource,
  ) => Promise<IServices.Response.IResponseFromResource<null>>;

  readonly deleteUserRefreshTokenByDeviceId: (
    deviceId: TDeviceId,
  ) => Promise<IServices.Response.IResponseFromResource<null>>;

  readonly getUserRefreshToken: (
    data: IParamsForGetUserRefreshTokenFromResource,
  ) => Promise<IServices.Response.IResponseFromResource<IAuthRefreshToken | null>>;
}
