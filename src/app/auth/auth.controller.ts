import { controller } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';

import { IEnums, IUtils, tokens, IServices, IModules } from '../../container';

@controller('/auth')
export default class AuthController {
  constructor(
    @inject(tokens.modules.authTokens.AuthServiceToken)
    private readonly authService: IModules.Auth.IAuthService,
  ) {}
}
