import { Container } from 'inversify';

import { IServices, tokens, IEnums } from './index';

import {
  ConfigService,
  DebugService,
  LoggerService,
  MongooseConnectionService,
  ResponseService,
} from '../services';

import { IModules, User } from '../app/app.module';

import { ResponseType } from '../enums';

const container: Container = new Container();

// ---------- modules ---------- //

container
  .bind<IModules.User.IUserService>(tokens.modules.userTokens.UserServiceToken)
  .to(User.UserService)
  .inSingletonScope();

container
  .bind<IModules.User.IUserResource>(tokens.modules.userTokens.UserResourceToken)
  .to(User.UserResource)
  .inSingletonScope();

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
