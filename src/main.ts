import 'reflect-metadata';
import { Request, Response } from 'express';

import {
  InversifyExpressServer,
  httpGet,
  controller,
} from 'inversify-express-utils';

import container from './inversify.config';

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

app.listen(4545, 'localhost', () => {
  // Will be updated
  console.log('Server was started: http://localhost:4545');
});
