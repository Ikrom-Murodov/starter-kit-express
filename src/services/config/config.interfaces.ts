// eslint-disable-next-line
import { PartialDeep } from 'type-fest';

export interface IConfigData {
  serverConfig: {
    host: string;
    port: number;
  };

  emails: { createUser: { user: string; pass: string } };

  resetPassword: {
    jwt: { secretKey: string; expiresIn: string };
    email: { user: string; pass: string };
  };

  oauth: {
    vk: { clientId: string; clientSecret: string; redirectUri: string };
    github: { clientId: string; clientSecret: string; redirectUri: string };
    google: { clientId: string; clientSecret: string; redirectUri: string };
  };

  register: {
    jwt: {
      accessToken: { secretKey: string; expiresIn: string };
      refreshToken: { secretKey: string; expiresIn: string };
    };

    createUser: { saltSize: number; iterations: number; length: number };
  };

  logger: {
    error: { uri: string; collection: string };
    warn: { uri: string; collection: string };
    info: { uri: string; collection: string };
  };

  mongodbConfig: { uri: string };
}

export interface IOptionalConfigData extends PartialDeep<IConfigData> {}

export interface IConfigService {
  get: IConfigData;
}
