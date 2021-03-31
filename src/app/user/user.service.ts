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
        }),
      },
    ),
  ) {}

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
}
