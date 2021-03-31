import { injectable, inject } from 'inversify';
import nodemailer from 'nodemailer';

import { tokens, IServices, IEnums } from '../../container';

@injectable()
export default class MailService implements IServices.Mail.IMailService {
  constructor(
    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,
  ) {}

  public async sendMail(params: IServices.Mail.ISendMailParams) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: params.user, pass: params.pass },
    });

    try {
      await transporter.sendMail({ ...params, text: params.text || '' });

      return this.responseService.responseFromService({
        data: null,
        errors: null,
        message: 'The message was sent successfully.',
        success: true,
        responseType: this.responseType.OK,
      });
    } catch (err) {
      return this.responseService.responseFromService({
        data: null,
        errors: err,
        message: 'Failed to send message.',
        success: false,
        responseType: this.responseType.INVALID_DATA,
      });
    }
  }
}
