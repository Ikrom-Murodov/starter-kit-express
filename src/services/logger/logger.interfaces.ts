export interface ILoggerService {
  error: (message: unknown) => void;
  warn: (message: unknown) => void;
  info: (message: unknown) => void;
}
