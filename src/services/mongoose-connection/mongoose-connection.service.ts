import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { IServices, tokens } from '../../container';

@injectable()
export default class MongooseConnectionService
  implements IServices.MongooseConnection.IMongooseConnectionService {
  public readonly connection: mongoose.Connection;

  constructor(
    @inject(tokens.services.LoggerServiceToken)
    private readonly loggerService: IServices.Logger.ILoggerService,

    @inject(tokens.services.DebugServiceToken)
    private readonly debugService: IServices.Debug.IDebugService,
  ) {
    mongoose
      .connect('mongodb://localhost/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(() => {
        this.debugService.debug(
          'app:mongoose',
          'Connecting to mongodb via mongoose was successful.',
        );
      })
      .catch((err) => {
        this.debugService.debug(
          'app:mongoose',
          'ERROR: failed to connect mongodb via mongoose.',
        );
        this.loggerService.error({ err });
      });

    this.connection = mongoose.connection;
  }
}
