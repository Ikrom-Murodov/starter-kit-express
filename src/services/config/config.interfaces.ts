// eslint-disable-next-line
import { PartialDeep } from 'type-fest';

export interface IConfigData {
  serverConfig: {
    host: string;
    port: number;
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
