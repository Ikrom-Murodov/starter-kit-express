import {
  controller,
  httpPatch,
  httpPost,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
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

  @httpPost('/login')
  public async login(
    @requestBody() body: IModules.Auth.IParamsForLoginUserFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.login(body);
    this.responseService.responseFromController(res, result);
  }

  @httpPatch('/verify-email/:emailVerifyToken')
  public async verifyEmail(
    @requestParam('emailVerifyToken')
    emailVerifyToken: IModules.User.TEmailVerifyToken,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.verifyEmail(emailVerifyToken);
    this.responseService.responseFromController(res, result);
  }

  @httpPost('/logout')
  public async logout(
    @requestBody() body: IModules.Auth.IParamsForLogoutUserFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.logout(body);
    this.responseService.responseFromController(res, result);
  }

  @httpPost('/refresh-token')
  public async refreshToken(
    @requestBody() body: IModules.Auth.IParamsForRefreshTokenUserFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.refreshToken(body);
    await this.responseService.responseFromController(res, result);
  }

  @httpPost('/is-authenticated')
  public async isAuthenticated(req: Request, res: Response) {
    const accessToken = req.headers.authorization as IModules.Auth.TAccessToken;
    const result = await this.authService.isAuthenticated(accessToken);
    this.responseService.responseFromController(res, result);
  }

  @httpPost('/oauth-login')
  public async loginViaOauth(
    @requestBody() body: IModules.Auth.IParamsForLoginUserViaOauthFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.loginViaOauth(body);
    this.responseService.responseFromController(res, result);
  }

  @httpPost('/generate-password-reset-token')
  public async generatePasswordResetToken(
    @requestBody() body: IModules.Auth.IParamsForGeneratePasswordResetTokenFromSErvice,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.generatePasswordResetToken(body);
    this.responseService.responseFromController(res, result);
  }

  @httpPost('/reset-password')
  public async resetPassword(
    @requestBody() body: IModules.Auth.IParamsForResetUserPasswordFromService,
    req: Request,
    res: Response,
  ) {
    const result = await this.authService.resetPassword(body);
    this.responseService.responseFromController(res, result);
  }
}
