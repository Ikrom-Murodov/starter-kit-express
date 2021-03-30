enum ResponseType {
  OK,
  CREATED,
  ACCEPTED,
  NO_CONTENT,

  INVALID_DATA,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  CONFLICT,
}

type IResponseType = typeof ResponseType;

export { ResponseType, IResponseType };
