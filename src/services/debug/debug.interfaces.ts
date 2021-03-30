export interface IDebugService {
  debug(namespace: string, formatter: unknown, ...args: unknown[]): void;
  log(...messages: unknown[]): void;

  enabled(namespace: string): boolean;

  enable(namespace: string): void;
  disable(namespace: string): void;

  disableAll(): void;
  enableAll(): void;
}
