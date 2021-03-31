import merge from 'webpack-merge';
import { injectable, inject } from 'inversify';

import { IServices, tokens } from '../../container';

import privateData from './private-data';

const defaultConfigData: IServices.Config.IConfigData = {
  serverConfig: { host: 'localhost', port: 4545 },

  oauth: privateData.oauth,

  logger: {
    error: { uri: 'mongodb://localhost/logger', collection: 'error' },
    warn: { uri: 'mongodb://localhost/logger', collection: 'warn' },
    info: { uri: 'mongodb://localhost/logger', collection: 'info' },
  },

  mongodbConfig: { uri: 'mongodb://localhost/test' },

  register: {
    jwt: {
      accessToken: { secretKey: 'SOME-ACCESS-SECRET-KEY', expiresIn: '1s' },
      refreshToken: { secretKey: 'SOME-REFRESH-SECRET-KEY', expiresIn: '15d' },
    },
    createUser: { saltSize: 128, iterations: 10, length: 128 },
  },

  emails: { createUser: { pass: privateData.pass, user: privateData.user } },
};

const configData: { [key: string]: IServices.Config.IOptionalConfigData } = {
  development: {},

  production: {
    register: { jwt: { accessToken: { expiresIn: '25m' } } },
  },
};

@injectable()
export default class ConfigService implements IServices.Config.IConfigService {
  private configData: IServices.Config.IConfigData | undefined;

  public get get(): IServices.Config.IConfigData {
    if (this.configData) return this.configData;

    const key = process.env.NODE_ENV;

    if (key && configData[key]) {
      this.configData = merge(
        defaultConfigData,
        configData[key],
      ) as IServices.Config.IConfigData;

      return this.configData;
    }

    this.configData = defaultConfigData;
    return this.configData;
  }
}
