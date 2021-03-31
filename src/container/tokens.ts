// ---------- services ---------- //

const ConfigServiceToken = Symbol('Config service token');
const DebugServiceToken = Symbol('Debug service token');
const LoggerServiceToken = Symbol('Logger service token');
const MongooseConnectionServiceToken = Symbol('Mongoose connection service');
const ResponseServiceToken = Symbol('Response service token');
const ValidationServiceToken = Symbol('Validation service token');
const MailServiceToken = Symbol('Mail service token');

// ---------- enums ---------- //

const ResponseTypeEnumToken = Symbol('Response type enum token');

// ---------- modules ---------- //

const userTokens = {
  UserServiceToken: Symbol('User service token.'),
  UserResourceToken: Symbol('User resource token'),
};

const authTokens = {
  AuthServiceToken: Symbol('Auth service token'),
  AuthResourceToken: Symbol('Auth resource token'),
};

// ---------- utils ---------- //

const objectFilteringToken = Symbol('Object filtering tokens.');
const generateSymbolsToken = Symbol('Generate symbols token.');
const generatePasswordToken = Symbol('Generate password token.');
const generateSaltToken = Symbol('Generate salt token.');

export default {
  services: {
    ConfigServiceToken,
    DebugServiceToken,
    LoggerServiceToken,
    MongooseConnectionServiceToken,
    ResponseServiceToken,
    ValidationServiceToken,
    MailServiceToken,
  },

  enums: { ResponseTypeEnumToken },

  modules: { userTokens, authTokens },

  utils: {
    objectFilteringToken,
    generateSymbolsToken,
    generatePasswordToken,
    generateSaltToken,
  },
};
