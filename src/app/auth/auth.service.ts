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

    @inject(tokens.services.ValidationServiceToken)
    private readonly validationService: IServices.Validation.IValidationService,

    @inject(tokens.services.GenerateTokenService)
    private readonly generateTokenService: IServices.GenerateToken.IGenerateTokenService,

    @inject(tokens.services.ConfigServiceToken)
    private readonly configService: IServices.Config.IConfigService,

    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    private readonly deviceIdSchema = validationService.string().required(),

    private readonly validationSchemaForLoginUser = validationService.object<IModules.Auth.IParamsForLoginUserFromService>(
      {
        email: userService.validationSchemaForUserEmail,
        password: userService.validationSchemaForUserPassword,
        deviceId: deviceIdSchema,
      },
    ),
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

  public async login(userData: IModules.Auth.IParamsForLoginUserFromService) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForLoginUser,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const response = await this.userService.findUsersByParams({
      limit: 1,
      find: { email: userData.email },
    });

    if (!response.data || !response.success) {
      return this.responseService.responseFromService({
        data: null,
        errors: { email: "User with this email doesn't exist. Please register." },
        message: 'You are not register.',
        responseType: this.responseType.NOT_FOUND,
        success: false,
      });
    }

    const user = response.data[0];

    if (!user.verifiedEmail) {
      return this.responseService.responseFromService({
        data: null,
        errors: { email: 'Email not verified.' },
        message: 'Please verify your email address.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }

    const passwordVerificationResult = await this.userService.checkPassword({
      password: userData.password,
      id: user.id,
    });
    if (!passwordVerificationResult.success) return passwordVerificationResult;

    this.authResource.deleteUserRefreshTokenByDeviceId(userData.deviceId);

    const pairToken = await this.issueTokenPair(user.id, userData.deviceId, {
      userId: user.id,
    });

    return this.responseService.responseFromService({
      data: pairToken,
      errors: null,
      success: true,
      responseType: this.responseType.OK,
      message: 'You are successfully logged in.',
    });
  }

  private async issueTokenPair(
    userId: IModules.User.IUser['id'],
    deviceId: IModules.Auth.TDeviceId,
    payloadForAccessToken: { [key: string]: string } = {},
    payloadForRefreshToken: { [key: string]: string } = {},
  ): Promise<IModules.Auth.IAuthPairToken> {
    const { jwt } = this.configService.get.register;

    const refreshToken = await this.generateTokenService.sign(
      payloadForRefreshToken,
      jwt.refreshToken.secretKey,
      { expiresIn: jwt.refreshToken.expiresIn },
    );

    await this.authResource.createUserRefreshToken({
      userId,
      refreshToken,
      deviceId,
    });

    const accessToken = await this.generateTokenService.sign(
      payloadForAccessToken,
      jwt.accessToken.secretKey,
      { expiresIn: jwt.accessToken.expiresIn },
    );

    return { refreshToken, accessToken };
  }
}
