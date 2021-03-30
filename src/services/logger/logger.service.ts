import { inject, injectable } from 'inversify';
import winston from 'winston';
import 'winston-mongodb';

import { tokens, IServices } from '../../container';

@injectable()
export default class LoggerService implements IServices.Logger.ILoggerService {
  constructor(
    @inject(tokens.services.ConfigServiceToken)
    private readonly configService: IServices.Config.IConfigService,
  ) {}

  private readonly mainFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
  );

  private warnLogger = winston.createLogger({
    level: 'warn',
    format: this.mainFormat,

    transports: [
      // @ts-ignore
      new winston.transports.MongoDB({
        level: 'warn',
        db: this.configService.get.logger.warn.uri,
        collection: this.configService.get.logger.warn.collection,

        options: { useUnifiedTopology: true },
        storeHost: true,
      }),
    ],
  });

  private readonly errorLogger = winston.createLogger({
    level: 'error',
    format: this.mainFormat,

    transports: [
      // @ts-ignore
      new winston.transports.MongoDB({
        level: 'error',
        db: this.configService.get.logger.error.uri,
        collection: this.configService.get.logger.error.collection,

        options: { useUnifiedTopology: true },
        storeHost: true,
      }),
    ],
  });

  private infoLogger = winston.createLogger({
    level: 'info',
    format: this.mainFormat,

    transports: [
      // @ts-ignore
      new winston.transports.MongoDB({
        level: 'info',
        db: this.configService.get.logger.info.uri,
        collection: this.configService.get.logger.info.collection,

        options: { useUnifiedTopology: true },
        storeHost: true,
      }),
    ],
  });

  public error(message: unknown): void {
    this.errorLogger.error(message);
  }

  public warn(message: unknown): void {
    this.warnLogger.warn(message);
  }

  public info(message: unknown): void {
    this.infoLogger.info(message);
  }
}
