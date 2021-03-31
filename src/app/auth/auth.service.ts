import { injectable, inject } from 'inversify';
import { IEnums, IModules, IServices, tokens, IUtils } from '../../container';

@injectable()
export default class AuthService implements IModules.Auth.IAuthService {
  constructor(
    @inject(tokens.modules.authTokens.AuthResourceToken)
    private readonly authResource: IModules.Auth.IAuthResource,
  ) {}
}
