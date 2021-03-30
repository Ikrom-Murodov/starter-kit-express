import merge from 'webpack-merge';
import { injectable, inject } from 'inversify';

import { IServices, tokens } from '../../container';

const defaultConfigData: IServices.Config.IConfigData = {
  serverConfig: { host: 'localhost', port: 4545 },

  logger: {
    error: { uri: 'mongodb://localhost/logger', collection: 'error' },
    warn: { uri: 'mongodb://localhost/logger', collection: 'warn' },
    info: { uri: 'mongodb://localhost/logger', collection: 'info' },
  },
};

const configData: { [key: string]: IServices.Config.IOptionalConfigData } = {
  development: {},

  production: {},
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
