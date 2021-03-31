import { IServices } from '../../container';

export interface ISendMailParams {
  user: string;
  pass: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface IMailService {
  sendMail: (
    params: ISendMailParams,
  ) => Promise<IServices.Response.IResponseFromService<null>>;
}
