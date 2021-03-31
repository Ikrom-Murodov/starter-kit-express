import { v4 as uuid } from 'uuid';
import * as IUtils from './interfaces';

const objectFiltering: IUtils.IObjectFiltering = (object, keys) => {
  return keys.reduce<any>((acc, key) => {
    // @ts-ignore
    if (typeof object[key] === 'function') acc[key] = object[key].bind(object);
    else acc[key] = object[key];
    return acc;
  }, {});
};

const generateSymbols: IUtils.IGenerateSymbols = () => uuid();

export { objectFiltering, generateSymbols };
