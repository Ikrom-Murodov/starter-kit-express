import { IModules, IServices } from '../../container';

export type TTypeOauthLogin = 'vk' | 'github' | 'google';
export type TCode = string;

export interface IDataFromOauth {
  name: IModules.User.IUser['name'];
  email: IModules.User.IUser['email'];
}

export interface IOauthService {
  vk: (
    code: TCode,
  ) => Promise<IServices.Response.IResponseFromService<IDataFromOauth | null>>;
  github: (
    code: TCode,
  ) => Promise<IServices.Response.IResponseFromService<IDataFromOauth | null>>;
  google: (
    code: TCode,
  ) => Promise<IServices.Response.IResponseFromService<IDataFromOauth | null>>;
}
