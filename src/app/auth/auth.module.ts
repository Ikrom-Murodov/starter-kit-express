import './auth.controller';

import AuthService from './auth.service';
import { AuthMongodbResource as AuthResource } from './auth-resource';
import * as AuthInterfaces from './auth.interfaces';

export { AuthResource, AuthService, AuthInterfaces };
