// ---------- services ---------- //

const ConfigServiceToken = Symbol('Config service token');
const DebugServiceToken = Symbol('Debug service token');
const LoggerServiceToken = Symbol('Logger service token');

export default {
  services: { ConfigServiceToken, DebugServiceToken, LoggerServiceToken },
};
