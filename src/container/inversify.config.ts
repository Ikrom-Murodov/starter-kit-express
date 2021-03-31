import { Container } from 'inversify';

import { IServices, tokens, IEnums, IUtils, IModules } from './index';

import {
  ConfigService,
  DebugService,
  LoggerService,
  MailService,
  MongooseConnectionService,
  ResponseService,
  ValidationService,
} from '../services';

import { User } from '../app/app.module';

import { ResponseType } from '../enums';
import { generateSymbols, objectFiltering } from '../utils';

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
  .bind<IServices.Validation.IValidationService>(tokens.services.ValidationServiceToken)
  .to(ValidationService)
  .inSingletonScope();

container
  .bind<IServices.Response.IResponseService>(tokens.services.ResponseServiceToken)
  .to(ResponseService)
  .inSingletonScope();

container
  .bind<IServices.Mail.IMailService>(tokens.services.MailServiceToken)
  .to(MailService)
  .inSingletonScope();

// ---------- enums ---------- //

container
  .bind<IEnums.IResponseType>(tokens.enums.ResponseTypeEnumToken)
  .toConstantValue(ResponseType);

// ---------- utils ---------- //

container
  .bind<IUtils.IObjectFiltering>(tokens.utils.objectFilteringToken)
  .toFunction(objectFiltering);

container
  .bind<IUtils.IGenerateSymbols>(tokens.utils.generateSymbolsToken)
  .toFunction(generateSymbols);

export default container;
