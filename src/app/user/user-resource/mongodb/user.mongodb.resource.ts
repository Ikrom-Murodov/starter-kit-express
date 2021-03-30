import { injectable, inject } from 'inversify';

import { tokens, IServices, IEnums, IModules } from '../../../../container';

@injectable()
export default class UserMongodbResource implements IModules.User.IUserResource {}
