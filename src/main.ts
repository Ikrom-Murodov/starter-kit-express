import 'reflect-metadata';

import { InversifyExpressServer } from 'inversify-express-utils';

import container from './container/inversify.config';
import { IServices, tokens } from './container';

const debugService = container.get<IServices.Debug.IDebugService>(
  tokens.services.DebugServiceToken,
);

const configService = container.get<IServices.Config.IConfigService>(
  tokens.services.ConfigServiceToken,
);

const ieServer = new InversifyExpressServer(container, null, {
  rootPath: '/api',
});

const app = ieServer.build();

app.listen(
  configService.get.serverConfig.port,
  configService.get.serverConfig.host,
  () => {
    debugService.debug(
      'app:server',
      `Server was started: http://${configService.get.serverConfig.host}:${configService.get.serverConfig.port}`,
    );
  },
);
