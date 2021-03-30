import { Response } from 'express';
import { ResponseType } from '../../enums';

export interface IResponseFromService<
  TData extends { [key: string]: any } | [] | null = null
> {
  success: boolean;
  responseType: ResponseType;
  message: string;
  data: TData;
  errors: { [key: string]: any } | null;
}

export interface IResponseFromResource<TData = any> {
  success: boolean;
  data: TData;
}

export interface IResponseService {
  responseFromService<TData extends { [key: string]: any } | [] | null = null>(
    data: IResponseFromService<TData>,
  ): IResponseFromService<TData>;

  responseFromController<TData = any>(
    res: Response,
    dataFromService: IResponseFromService<TData>,
  ): void;
}
