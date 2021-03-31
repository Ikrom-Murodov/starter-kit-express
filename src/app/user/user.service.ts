import { injectable, inject } from 'inversify';

import { IEnums, IServices, tokens, IModules } from '../../container';

@injectable()
export default class UserService implements IModules.User.IUserService {
  constructor(
    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.services.ValidationServiceToken)
    private readonly validationService: IServices.Validation.IValidationService,

    @inject(tokens.modules.userTokens.UserResourceToken)
    private readonly userResource: IModules.User.IUserResource,

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
}
