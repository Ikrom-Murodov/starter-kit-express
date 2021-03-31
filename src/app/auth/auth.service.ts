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

    @inject(tokens.services.MailServiceToken)
    private readonly mailService: IServices.Mail.IMailService,

    @inject(tokens.services.OauthServiceToken)
    private readonly oauthService: IServices.Oauth.IOauthService,

    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    private readonly deviceIdSchema = validationService.string().required(),
    private readonly refreshTokenSchema = validationService.string().required(),

    private readonly validationSchemaForLoginUser = validationService.object<IModules.Auth.IParamsForLoginUserFromService>(
      {
        email: userService.validationSchemaForUserEmail,
        password: userService.validationSchemaForUserPassword,
        deviceId: deviceIdSchema,
      },
    ),

    private readonly emailVerifyTokenSchema = validationService.string().required(),

    private readonly validationSchemaForRefreshToken = validationService.object<IModules.Auth.IParamsForRefreshTokenUserFromService>(
      {
        refreshToken: refreshTokenSchema,
        deviceId: deviceIdSchema,
      },
    ),

    private readonly accessTokenSchema = validationService.string().required(),

    private readonly validationSchemaForLoginUserViaOauth = validationService.object<IModules.Auth.IParamsForLoginUserViaOauthFromService>(
      {
        deviceId: deviceIdSchema,
        type: validationService.string().valid('vk', 'github', 'google').required(),
        code: validationService.string().required(),
      },
    ),

    private readonly validatioonSchemaForGeneratePasswordResetToken = validationService.object<IModules.Auth.IParamsForGeneratePasswordResetTokenFromSErvice>(
      {
        email: userService.validationSchemaForUserEmail,
      },
    ),

    private readonly validationSchemaForResetUserPassword = validationService.object<IModules.Auth.IParamsForResetUserPasswordFromService>(
      {
        newPassword: userService.validationSchemaForUserPassword,
        passwordResetToken: validationService.string().required(),
      },
    ),

    private readonly validationSchemaForLogoutUser = validationService.object<IModules.Auth.IParamsForLogoutUserFromService>(
      {
        accessToken: accessTokenSchema,
        deviceId: deviceIdSchema,
      },
    ),
  ) {}

  public async generatePasswordResetToken(
    userData: IModules.Auth.IParamsForGeneratePasswordResetTokenFromSErvice,
  ) {
    const validationErrors = await this.validationService.validationData(
      this.validatioonSchemaForGeneratePasswordResetToken,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const response = await this.userService.findUsersByParams({
      find: { email: userData.email },
      limit: 1,
    });

    if (!response.data) {
      return this.responseService.responseFromService({
        data: null,
        errors: { email: "User with this email doesn't exist." },
        message: 'Invalid email.',
        responseType: this.responseType.NOT_FOUND,
        success: false,
      });
    }

    const user = response.data[0];
    const completeUserData = await this.userService.getCompleteUserDataById(user.id);

    if (completeUserData.data!.registerType !== 'base') {
      return this.responseService.responseFromService({
        data: null,
        message: 'You cannot change your password because you registered with oauth.',
        errors: null,
        responseType: this.responseType.METHOD_NOT_ALLOWED,
        success: false,
      });
    }

    const { resetPassword } = this.configService.get;

    const passwordResetToken = await this.generateTokenService.sign(
      { id: user.id },
      resetPassword.jwt.secretKey,
      { expiresIn: resetPassword.jwt.expiresIn },
    );

    const responseFromMailService = await this.mailService.sendMail({
      user: resetPassword.email.user,
      pass: resetPassword.email.pass,
      from: resetPassword.email.user,
      to: [userData.email],
      subject: 'Password recovery.',
      html: `
        <h1>For further password reset follow this
          <a href="http://localhost:4040/register?passwordResetToken=${passwordResetToken}">link.</a>
        </h1>
        <h3>If it's not you then ignore this message.</h3>
        <h4>This link is valid for thirty minutes.</h4>
      `,
    });

    if (!responseFromMailService.success) {
      return this.responseService.responseFromService({
        ...responseFromMailService,
        message: 'Invalid data.',
        errors: { email: 'Failed to send a message to your email.' },
      });
    }

    await this.userService.updatePrivateUserDataById({
      id: user.id,
      update: { passwordResetToken },
    });

    return this.responseService.responseFromService({
      data: null,
      success: true,
      errors: null,
      message: 'We have sent instructions on how to recover your password to your email.',
      responseType: this.responseType.OK,
    });
  }

  public async logout(userData: IModules.Auth.IParamsForLogoutUserFromService) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForLogoutUser,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const authenticationCheckResult = await this.isAuthenticated(userData.accessToken);
    if (!authenticationCheckResult.success) return authenticationCheckResult;

    await this.authResource.deleteUserRefreshTokenByDeviceId(userData.deviceId);

    return this.responseService.responseFromService({
      data: null,
      errors: null,
      message: 'You have successfully logged out.',
      responseType: this.responseType.OK,
      success: true,
    });
  }

  public async resetPassword(
    userData: IModules.Auth.IParamsForResetUserPasswordFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForResetUserPassword,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    try {
      const { resetPassword } = this.configService.get;

      const data = await this.generateTokenService.verify(
        userData.passwordResetToken,
        resetPassword.jwt.secretKey,
      );
      const response = await this.userService.getCompleteUserDataById(data.id);
      const user = response.data;

      if (!user) {
        return this.responseService.responseFromService({
          data: null,
          errors: { refreshToken: 'Your data has been deleted.' },
          message: 'Not found.',
          responseType: this.responseType.NOT_FOUND,
          success: false,
        });
      }

      if (user.passwordResetToken !== userData.passwordResetToken) {
        return this.responseService.responseFromService({
          data: null,
          errors: null,
          message: 'Invalid data.',
          responseType: this.responseType.INVALID_DATA,
          success: false,
        });
      }

      const { passwordHash, salt } = await this.userService.generateSaltAndPasswordHash(
        userData.newPassword,
      );

      await this.userService.updatePrivateUserDataById({
        id: data.id,
        update: { salt, passwordHash, passwordResetToken: null },
      });

      return this.responseService.responseFromService({
        data: null,
        errors: null,
        message: 'Your password has been successfully updated.',
        responseType: this.responseType.OK,
        success: true,
      });
    } catch (err) {
      return this.responseService.responseFromService({
        data: null,
        errors: null,
        message: 'Invalid data.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }
  }

  public async verifyEmail(emailVerifyToken: IModules.User.TEmailVerifyToken) {
    const validationErrors = await this.validationService.validationData(
      this.emailVerifyTokenSchema,
      emailVerifyToken,
    );
    if (!validationErrors.success) return validationErrors;

    const response = await this.userService.findUsersByParams({
      find: { emailVerifyToken },
      limit: 1,
    });

    if (!response.success || !response.data) {
      return this.responseService.responseFromService({
        data: null,
        success: false,
        errors: { token: 'You have passed an invalid token.' },
        message: 'Invalid token.',
        responseType: this.responseType.INVALID_DATA,
      });
    }

    const user = response.data[0];

    await this.userService.updatePrivateUserDataById({
      id: user.id,
      update: { emailVerifyToken: null, verifiedEmail: true },
    });

    return this.responseService.responseFromService({
      data: null,
      errors: null,
      success: true,
      message: 'Your email address has been successfully verified.',
      responseType: this.responseType.OK,
    });
  }

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

  public async isAuthenticated(accessToken: IModules.Auth.TAccessToken) {
    const validationErrors = await this.validationService.validationData(
      this.accessTokenSchema,
      accessToken,
    );
    if (!validationErrors.success) return validationErrors;

    try {
      await this.generateTokenService.verify(
        accessToken,
        this.configService.get.register.jwt.accessToken.secretKey,
      );

      return this.responseService.responseFromService({
        data: null,
        errors: null,
        message: 'User is authorized.',
        responseType: this.responseType.OK,
        success: true,
      });
    } catch (err) {
      return this.responseService.responseFromService({
        success: false,
        data: null,
        errors: { ...err },
        message: 'User is not authorized.',
        responseType: this.responseType.UNAUTHORIZED,
      });
    }
  }

  public async refreshToken(
    userData: IModules.Auth.IParamsForRefreshTokenUserFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForRefreshToken,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    try {
      await this.generateTokenService.verify(
        userData.refreshToken,
        this.configService.get.register.jwt.refreshToken.secretKey,
      );

      const result = await this.authResource.getUserRefreshToken(userData);

      if (!result.success || !result.data) {
        return this.responseService.responseFromService({
          data: null,
          errors: { refreshToken: 'Refresh token was not found.' },
          message: 'Not found.',
          responseType: this.responseType.NOT_FOUND,
          success: false,
        });
      }

      const { deviceId, userId } = result.data;
      await this.authResource.deleteUserRefreshTokenByDeviceId(deviceId);
      const pairToken = await this.issueTokenPair(userId, deviceId, { userId });

      return this.responseService.responseFromService({
        data: pairToken,
        errors: null,
        message: 'A pair of new tokens was created',
        responseType: this.responseType.CREATED,
        success: true,
      });
    } catch (err) {
      await this.authResource.deleteUserRefreshTokenByDeviceId(userData.deviceId);

      return this.responseService.responseFromService({
        data: null,
        errors: { refreshToken: 'Refresh token is invalid.' },
        message: 'Please login again.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }
  }

  public async loginViaOauth(
    params: IModules.Auth.IParamsForLoginUserViaOauthFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForLoginUserViaOauth,
      params,
    );
    if (!validationErrors.success) return validationErrors;

    const userData = await this.oauthService[params.type](params.code);

    if (!userData.success || !userData.data) {
      return this.responseService.responseFromService({
        ...userData,
        data: null,
      });
    }

    const response = await this.userService.findUsersByParams({
      find: { email: userData.data.email },
      limit: 1,
    });

    let userId: IModules.User.IUser['id'];

    if (!response.data) {
      const user = await this.userService.createUserViaOauth(userData.data);
      userId = user.data!.id;
    } else userId = response.data[0].id;

    this.authResource.deleteUserRefreshTokenByDeviceId(params.deviceId);

    const pairToken = await this.issueTokenPair(userId, params.deviceId, {
      userId,
    });

    return this.responseService.responseFromService({
      data: pairToken,
      errors: null,
      message: 'You are successfully logged in.',
      responseType: this.responseType.OK,
      success: true,
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
