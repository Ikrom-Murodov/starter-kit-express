import { Application } from 'express';

import bodyParser from './bodyParser';
import cors from './cors';

export default (app: Application) => {
  bodyParser(app);
  cors(app);
};
