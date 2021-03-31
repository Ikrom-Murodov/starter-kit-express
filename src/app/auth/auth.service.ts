import { injectable, inject } from 'inversify';
import { IEnums, IModules, IServices, tokens, IUtils } from '../../container';

@injectable()
export default class AuthService implements IModules.Auth.IAuthService {
  constructor(
    @inject(tokens.modules.userTokens.UserServiceToken)
    private readonly userService: IModules.User.IUserService,

    @inject(tokens.modules.authTokens.AuthResourceToken)
    private readonly authResource: IModules.Auth.IAuthResource,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,
  ) {}

  public async register(userData: IModules.Auth.IParamsForRegisterUserFromService) {
    const response = await this.userService.createUser(userData);
    if (!response.success) return response;

    return this.responseService.responseFromService({
      ...response,
      message: `Your data has been successfully saved. We have sent an email to your
      email, which describes what needs to be done for further registration.`,
    });
  }
}
