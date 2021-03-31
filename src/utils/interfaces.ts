export interface IObjectFiltering {
  <Obj extends object, Keys extends keyof Obj>(object: Obj, keys: Array<Keys>): {
    [K in Keys]: Obj[K];
  };
}
