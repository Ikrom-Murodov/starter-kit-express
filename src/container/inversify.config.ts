import { Container } from 'inversify';

import { IServices, tokens, IEnums } from './index';

import {
  ConfigService,
  DebugService,
  LoggerService,
  MongooseConnectionService,
  ResponseService,
} from '../services';

import { ResponseType } from '../enums';

const container: Container = new Container();

// ---------- services ---------- //
container
  .bind<IServices.Config.IConfigService>(tokens.services.ConfigServiceToken)
  .to(ConfigService)
  .inSingletonScope();

container
  .bind<IServices.Debug.IDebugService>(tokens.services.DebugServiceToken)
  .to(DebugService)
  .inSingletonScope();

container
  .bind<IServices.Logger.ILoggerService>(tokens.services.LoggerServiceToken)
  .to(LoggerService)
  .inSingletonScope();

container
  .bind<IServices.MongooseConnection.IMongooseConnectionService>(
    tokens.services.MongooseConnectionServiceToken,
  )
  .to(MongooseConnectionService)
  .inSingletonScope();

container
  .bind<IServices.Response.IResponseService>(tokens.services.ResponseServiceToken)
  .to(ResponseService)
  .inSingletonScope();

// ---------- enums ---------- //

container
  .bind<IEnums.IResponseType>(tokens.enums.ResponseTypeEnumToken)
  .toConstantValue(ResponseType);

export default container;
