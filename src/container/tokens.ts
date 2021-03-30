// ---------- services ---------- //

const ConfigServiceToken = Symbol('Config service token');
const DebugServiceToken = Symbol('Debug service token');
const LoggerServiceToken = Symbol('Logger service token');
const MongooseConnectionServiceToken = Symbol('Mongoose connection service');
const ResponseServiceToken = Symbol('Response service token');

// ---------- enums ---------- //

const ResponseTypeEnumToken = Symbol('Response type enum token');

export default {
  services: {
    ConfigServiceToken,
    DebugServiceToken,
    LoggerServiceToken,
    MongooseConnectionServiceToken,
    ResponseServiceToken,
  },

  enums: { ResponseTypeEnumToken },
};
