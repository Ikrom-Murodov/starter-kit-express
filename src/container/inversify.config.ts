import { Container } from 'inversify';

import { IServices, tokens } from './index';

import { ConfigService } from '../services';

const container: Container = new Container();

// ---------- services ---------- //
container
  .bind<IServices.Config.IConfig>(tokens.services.ConfigServiceToken)
  .to(ConfigService)
  .inSingletonScope();

export default container;
