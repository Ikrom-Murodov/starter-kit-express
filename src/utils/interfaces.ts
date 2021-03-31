export interface IObjectFiltering {
  <Obj extends object, Keys extends keyof Obj>(object: Obj, keys: Array<Keys>): {
    [K in Keys]: Obj[K];
  };
}

export interface IGenerateSymbols {
  (): string;
}

export interface IGenerateSalt {
  (size: number, encoding: BufferEncoding): Promise<string>;
}

export interface IGeneratePassword {
  (salt: string, password: string, iterators: number, length: number): Promise<string>;
}
