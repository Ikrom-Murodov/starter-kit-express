import { injectable, inject } from 'inversify';

import { IEnums, IServices, tokens, IModules, IUtils } from '../../container';

@injectable()
export default class UserService implements IModules.User.IUserService {
  constructor(
    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.services.ValidationServiceToken)
    private readonly validationService: IServices.Validation.IValidationService,

    @inject(tokens.services.MailServiceToken)
    private readonly mailService: IServices.Mail.IMailService,

    @inject(tokens.services.ConfigServiceToken)
    private readonly configService: IServices.Config.IConfigService,

    @inject(tokens.modules.userTokens.UserResourceToken)
    private readonly userResource: IModules.User.IUserResource,

    @inject(tokens.utils.generateSymbolsToken)
    private readonly generateSymbolsUtil: IUtils.IGenerateSymbols,

    @inject(tokens.utils.generateSaltToken)
    private readonly generateSaltUtil: IUtils.IGenerateSalt,

    @inject(tokens.utils.generatePasswordToken)
    private readonly generatePasswordUtil: IUtils.IGeneratePassword,

    public readonly validationSchemaForUserPassword = validationService
      .string()
      .required()
      .min(10)
      .max(30),

    public readonly validationSchemaForUserEmail = validationService
      .string()
      .required()
      .email(),

    public readonly validationSchemaForUserId = validationService.string().required(),

    private readonly validationSchemaForCheckPassword = validationService.object<IModules.User.IParamsForCheckUserPasswordFromService>(
      {
        id: validationSchemaForUserId,
        password: validationSchemaForUserPassword,
      },
    ),

    private readonly validationSchemaForCreateUser = validationService.object<IModules.User.IParamsForCreateUserFromService>(
      {
        name: validationService.string().required().min(3).max(30),
        surname: validationService.string().required().min(3).max(30),
        age: validationService.number().required().min(18).max(100),
        email: validationSchemaForUserEmail,
        password: validationSchemaForUserPassword,
      },
    ),

    private readonly validationSchemaForFindUsersByParams = validationService.object<IModules.User.IParamsForFindUsersByParamsFromService>(
      {
        limit: validationService.number().required().min(1),
        find: validationService.object<
          IModules.User.IParamsForFindUsersByParamsFromService['find']
        >({
          name: validationService.string().min(3).max(20),
          surname: validationService.string().min(3).max(20),
          age: validationService.number().min(18).max(100),
          email: validationService.string().email(),
          id: validationService.string(),
          verifiedEmail: validationService.boolean(),
          emailVerifyToken: validationService.string(),
        }),
      },
    ),

    private readonly validationSchemaForUpdatePrivateUserData = validationService.object<IModules.User.IParamsForUpdatePrivateUserDataByIdFromService>(
      {
        id: validationSchemaForUserId,
        update: validationService.object<
          IModules.User.IParamsForUpdatePrivateUserDataByIdFromService['update']
        >({
          name: validationService.string().min(3).max(20),
          surname: validationService.string().min(3).max(20),
          age: validationService.number().min(18).max(100),
          email: validationService.string().email(),
          salt: validationService.string(),
          passwordHash: validationService.string(),
          verifiedEmail: validationService.boolean(),
          passwordResetToken: validationService.any(),
          emailVerifyToken: validationService.any(),
          registerType: validationService.string().valid('base', 'oauth'),
        }),
      },
    ),

    private readonly validationSchemaForCreateUserViaOauth = validationService.object<IModules.User.IParamsForCreateUserViaOauthFromService>(
      {
        email: validationService.string().required(),
        name: validationService.string().required(),
      },
    ),
  ) {}

  public async checkPassword(
    userData: IModules.User.IParamsForCheckUserPasswordFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForCheckPassword,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const result = await this.userResource.getCompleteUserDataById(userData.id);

    if (!result.data || !result.success) return this.userByIdNotFound(userData.id);

    const { passwordHash } = await this.generateSaltAndPasswordHash(
      userData.password,
      result.data.salt,
    );

    if (passwordHash !== result.data.passwordHash) {
      return this.responseService.responseFromService({
        data: null,
        errors: { password: "Passwords don't match." },
        message: 'Invalid data.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }

    return this.responseService.responseFromService({
      data: null,
      success: true,
      responseType: this.responseType.OK,
      errors: null,
      message: 'Passwords match.',
    });
  }

  public async createUserViaOauth(
    userData: IModules.User.IParamsForCreateUserViaOauthFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForCreateUserViaOauth,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const user = await this.findUsersByParams({
      limit: 1,
      find: { email: userData.email },
    });

    if (user.data) {
      return this.responseService.responseFromService({
        data: null,
        errors: { email: 'A user with this email address already exists.' },
        message: 'Email is busy.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }

    const newUser = await this.userResource.createUserViaOauth({
      ...userData,
      age: null,
      emailVerifyToken: null,
      passwordHash: null,
      passwordResetToken: null,
      registerType: 'oauth',
      salt: null,
      surname: null,
      verifiedEmail: true,
    });

    return this.responseService.responseFromService({
      data: newUser.data,
      errors: null,
      message: 'The user was successfully created.',
      responseType: this.responseType.CREATED,
      success: true,
    });
  }

  public async createUser(userData: IModules.User.IParamsForCreateUserFromService) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForCreateUser,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const user = await this.findUsersByParams({
      limit: 1,
      find: { email: userData.email },
    });

    if (user.success) {
      return this.responseService.responseFromService({
        data: null,
        errors: { email: 'A user with this email address already exists.' },
        message: 'Email is busy.',
        responseType: this.responseType.INVALID_DATA,
        success: false,
      });
    }

    const emailVerifyToken = this.generateSymbolsUtil();

    const responseFromMailService = await this.mailService.sendMail({
      user: this.configService.get.emails.createUser.user,
      pass: this.configService.get.emails.createUser.pass,
      from: this.configService.get.emails.createUser.user,
      to: [userData.email],
      subject: 'Email confirmation',
      html: `<h1>To verify your email address, follow this link.</h1><a href="http://localhost:4040/register?emailVerifyToken=${emailVerifyToken}">LINK</a>`,
    });

    if (!responseFromMailService.success) {
      return this.responseService.responseFromService({
        ...responseFromMailService,
        message: 'Invalid data.',
        errors: { email: 'Failed to send a message to your email.' },
      });
    }

    const { passwordHash, salt } = await this.generateSaltAndPasswordHash(
      userData.password,
    );

    const result = await this.userResource.createUser({
      ...userData,
      passwordHash,
      salt,
      emailVerifyToken,
      verifiedEmail: false,
      passwordResetToken: null,
      registerType: 'base',
    });

    return this.responseService.responseFromService({
      data: result.data,
      errors: null,
      message: 'The user was successfully created.',
      responseType: this.responseType.CREATED,
      success: true,
    });
  }

  public async findUsersByParams(
    params: IModules.User.IParamsForFindUsersByParamsFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForFindUsersByParams,
      params,
    );
    if (!validationErrors.success) return validationErrors;

    const result = await this.userResource.findUsersByParams(params);

    if (result.success) {
      return this.responseService.responseFromService({
        ...result,
        errors: null,
        message: 'Result filtration.',
        responseType: this.responseType.OK,
      });
    }

    return this.responseService.responseFromService({
      ...result,
      errors: { 'not-found': 'No user found with these parameters.' },
      message: 'Not found',
      responseType: this.responseType.NOT_FOUND,
    });
  }

  public async generateSaltAndPasswordHash(
    password: IModules.User.TUserPassword,
    salt?: IModules.User.IUser['salt'],
  ) {
    const { saltSize, iterations, length } = this.configService.get.register.createUser;

    // eslint-disable-next-line
    if (!salt) salt = await this.generateSaltUtil(saltSize, 'hex');

    const passwordHash = await this.generatePasswordUtil(
      salt,
      password,
      iterations,
      length,
    );

    return { salt, passwordHash };
  }

  public async updatePrivateUserDataById(
    userData: IModules.User.IParamsForUpdatePrivateUserDataByIdFromService,
  ) {
    const validationErrors = await this.validationService.validationObject(
      this.validationSchemaForUpdatePrivateUserData,
      userData,
    );
    if (!validationErrors.success) return validationErrors;

    const response = await this.userResource.updatePrivateUserDataById(userData);
    if (!response.success || !response.data) return this.userByIdNotFound(userData.id);

    return this.responseService.responseFromService({
      ...response,
      errors: null,
      responseType: this.responseType.OK,
      message: "User's private data has been successfully updated",
    });
  }

  public async getCompleteUserDataById(id: IModules.User.IUser['id']) {
    const validationErrors = await this.validationService.validationData(
      this.validationSchemaForUserId,
      id,
    );
    if (!validationErrors.success) return validationErrors;

    const result = await this.userResource.getCompleteUserDataById(id);
    if (!result.success || !result.data) return this.userByIdNotFound(id);

    return this.responseService.responseFromService({
      ...result,
      errors: null,
      message: '',
      responseType: this.responseType.OK,
    });
  }

  private userByIdNotFound(
    id: IModules.User.IUser['id'],
  ): IServices.Response.IResponseFromService<null> {
    return this.responseService.responseFromService({
      data: null,
      errors: { notExist: `User with this id: ${id} was not found.` },
      message: 'Not found.',
      responseType: this.responseType.NOT_FOUND,
      success: false,
    });
  }
}
