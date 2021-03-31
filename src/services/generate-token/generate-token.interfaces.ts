import {
  Secret,
  SignOptions,
  GetPublicKeyOrSecret,
  VerifyOptions,
  DecodeOptions,
} from 'jsonwebtoken';

export interface IDecode {
  (token: string, options?: DecodeOptions): any;
}

export interface IVerify {
  (
    token: string,
    secretOrPublicKey: Secret | GetPublicKeyOrSecret,
    options?: VerifyOptions,
  ): Promise<any>;
}

export interface ISign {
  (
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options?: SignOptions,
  ): Promise<string>;
}

export interface IGenerateTokenService {
  readonly decode: IDecode;
  readonly verify: IVerify;
  readonly sign: ISign;
}
