import { controller, httpPost, requestBody } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';

import { IEnums, IUtils, tokens, IServices, IModules } from '../../container';

@controller('/auth')
export default class AuthController {
  constructor(
    @inject(tokens.modules.authTokens.AuthServiceToken)
    private readonly authService: IModules.Auth.IAuthService,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,
  ) {}

  @httpPost('/register')
  public async register(
    @requestBody() body: IModules.Auth.IParamsForRegisterUserFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.register(body);
    this.responseService.responseFromController(res, result);
  }
}
