import { Application, Request, Response, NextFunction, request } from 'express';

export default (app: Application) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4040');
    res.set('Access-Control-Allow-Headers', 'content-type, authorization');
    res.set('Access-Control-Allow-Methods', 'POST, PATCH, PUT, GET, DELETE');
    // res.set('Access-Control-Allow-Credentials', 'true');

    next();
  });
};
