import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';

import { tokens, IServices } from '../../container';

@injectable()
export default class GenerateTokenService
  implements IServices.GenerateToken.IGenerateTokenService {
  public decode: IServices.GenerateToken.IDecode = (token, options = {}) => {
    return jwt.decode(token, options);
  };

  public verify: IServices.GenerateToken.IVerify = (
    token,
    secretOrPublicKey,
    options = {},
  ) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, options, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };

  public sign: IServices.GenerateToken.ISign = (
    payload,
    secretOrPrivateKey,
    options = {},
  ) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      });
    });
  };
}
