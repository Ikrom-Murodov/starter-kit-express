import { injectable, inject } from 'inversify';

import { IEnums, IServices, tokens, IModules } from '../../container';

@injectable()
export default class UserService implements IModules.User.IUserService {
  constructor(
    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,

    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.modules.userTokens.UserResourceToken)
    private readonly userResource: IModules.User.IUserResource,
  ) {}
}
