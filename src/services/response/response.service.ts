import { injectable, inject } from 'inversify';
import { Response } from 'express';

import { ResponseType } from '../../enums';
import { IServices } from '../../container';

@injectable()
export default class ResponseService implements IServices.Response.IResponseService {
  private readonly httpStatusFromResponseType: {
    [key in ResponseType]: number;
  } = {
    [ResponseType.OK]: 200,
    [ResponseType.CREATED]: 201,
    [ResponseType.ACCEPTED]: 202,
    [ResponseType.NO_CONTENT]: 204,

    [ResponseType.INVALID_DATA]: 400,
    [ResponseType.UNAUTHORIZED]: 401,
    [ResponseType.FORBIDDEN]: 403,
    [ResponseType.NOT_FOUND]: 404,
    [ResponseType.METHOD_NOT_ALLOWED]: 405,
    [ResponseType.CONFLICT]: 409,
  };

  public responseFromService<TData extends { [key: string]: any } | [] | null = null>(
    data: IServices.Response.IResponseFromService<TData>,
  ): IServices.Response.IResponseFromService<TData> {
    return data;
  }

  public responseFromController<TData extends { [key: string]: any } | [] | null = null>(
    res: Response<IServices.Response.IResponseFromController<TData>>,
    dataFromService: IServices.Response.IResponseFromService<TData>,
  ) {
    const status = this.httpStatusFromResponseType[dataFromService.responseType];
    res.status(status).json({
      status,
      data: dataFromService.data,
      errors: dataFromService.errors,
      message: dataFromService.message,
      success: dataFromService.success,
    });
  }
}
