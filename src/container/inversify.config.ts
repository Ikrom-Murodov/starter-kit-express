import { Container } from 'inversify';

import { IServices, tokens } from './index';

import { ConfigService, DebugService } from '../services';

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

export default container;
