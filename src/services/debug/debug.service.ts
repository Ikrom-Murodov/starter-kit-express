import { injectable, inject } from 'inversify';
import createDebug from 'debug';

import { IServices, tokens } from '../../container';

// You can make this debugger smarter.

@injectable()
export default class DebugService implements IServices.Debug.IDebugService {
  private enabledDebuggers: Map<string, createDebug.IDebugger> = new Map();

  private disabledDebuggers: Map<string, createDebug.IDebugger> = new Map();

  public debug(namespace: string, formatter: unknown, ...args: unknown[]): void {
    const debug = this.enabledDebuggers.get(namespace);

    if (debug) debug(formatter, args);
    else if (!this.disabledDebuggers.has(namespace)) {
      const newDebug = createDebug(namespace);
      newDebug(formatter, ...args);
      this.enabledDebuggers.set(namespace, newDebug);
    }
  }

  public enabled(namespace: string): boolean {
    return this.enabledDebuggers.has(namespace);
  }

  public enable(namespace: string): void {
    const debug = this.disabledDebuggers.get(namespace);

    if (debug) {
      this.enabledDebuggers.set(namespace, debug);
      this.disabledDebuggers.delete(namespace);
    }
  }

  public disable(namespace: string): void {
    const debug = this.enabledDebuggers.get(namespace);

    if (debug) {
      this.disabledDebuggers.set(namespace, debug);
      this.enabledDebuggers.delete(namespace);
    }
  }

  public enableAll(): void {
    this.enabledDebuggers = new Map([
      ...this.enabledDebuggers,
      ...this.disabledDebuggers,
    ]);

    this.disabledDebuggers.clear();
  }

  public disableAll(): void {
    this.disabledDebuggers = new Map([
      ...this.enabledDebuggers,
      ...this.disabledDebuggers,
    ]);

    this.enabledDebuggers.clear();
  }

  public log(...messages: unknown[]): void {
    createDebug.log(...messages);
  }
}
