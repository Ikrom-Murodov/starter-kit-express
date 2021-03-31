import crypto from 'crypto';
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

const generatePassword: IUtils.IGeneratePassword = (
  salt,
  password,
  iterators,
  length,
) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterators, length, 'sha512', (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('hex'));
    });
  });
};

const generateSalt: IUtils.IGenerateSalt = (size, encoding) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) reject(err);
      else resolve(buf.toString(encoding));
    });
  });
};

const generateSymbols: IUtils.IGenerateSymbols = () => uuid();

export { objectFiltering, generateSymbols, generateSalt, generatePassword };
