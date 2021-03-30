import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';

import { IServices, tokens, IEnums, IModules } from '../../container';

@controller('/users')
export default class UserController {
  constructor(
    @inject(tokens.modules.userTokens.UserServiceToken)
    private readonly userService: IModules.User.IUserService,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,
  ) {}
}
