// eslint-disable-next-line
import { PartialDeep } from 'type-fest';

export interface IConfigData {
  serverConfig: {
    host: string;
    port: number;
  };
}

export interface IOptionalConfigData extends PartialDeep<IConfigData> {}

export interface IConfig {
  get: IConfigData;
}
