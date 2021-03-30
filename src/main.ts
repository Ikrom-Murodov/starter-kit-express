import 'reflect-metadata';
import { Request, Response } from 'express';

import { InversifyExpressServer, httpGet, controller } from 'inversify-express-utils';

import container from './container/inversify.config';
import { IServices, tokens } from './container';

const debugService = container.get<IServices.Debug.IDebugService>(
  tokens.services.DebugServiceToken,
);

const configService = container.get<IServices.Config.IConfigService>(
  tokens.services.ConfigServiceToken,
);

// Will be updated
@controller('/test')
class Test {
  @httpGet('/')
  test(req: Request, res: Response) {
    res.status(200).json({ message: 'Hello Ikrom Murodov' });
  }
}
// Will be updated //

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
