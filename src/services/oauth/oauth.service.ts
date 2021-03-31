import { inject, injectable } from 'inversify';
import axios from 'axios';

import { tokens, IServices, IEnums } from '../../container';

@injectable()
export default class OauthService implements IServices.Oauth.IOauthService {
  constructor(
    @inject(tokens.services.ResponseServiceToken)
    private readonly responseService: IServices.Response.IResponseService,

    @inject(tokens.services.ConfigServiceToken)
    private readonly configService: IServices.Config.IConfigService,

    @inject(tokens.enums.ResponseTypeEnumToken)
    private readonly responseType: IEnums.IResponseType,
  ) {}

  public async vk(code: IServices.Oauth.TCode) {
    const { vk } = this.configService.get.oauth;

    const url = `https://oauth.vk.com/access_token?client_id=${vk.clientId}&client_secret=${vk.clientSecret}&code=${code}&redirect_uri=${vk.redirectUri}`;

    try {
      const response = await axios.get(url);
      if (!response.data.email) return this.notFound('email');

      const { data } = await axios.get(
        `https://api.vk.com/method/users.get?v=5.52&access_token=${response.data.access_token}`,
      );
      if (!data.response[0].first_name) return this.notFound('name');

      return this.ok({
        name: data.response[0].first_name,
        email: response.data.email,
      });
    } catch (error) {
      return this.invalidData('vk');
    }
  }

  public async github(code: IServices.Oauth.TCode) {
    const { github } = this.configService.get.oauth;

    const url = `https://github.com/login/oauth/access_token?client_id=${github.clientId}&redirect_uri=${github.redirectUri}&client_secret=${github.clientSecret}&code=${code}`;

    try {
      const response = await axios.post(url, '', {
        headers: { accept: 'application/json' },
      });

      const { data } = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${response.data.access_token}` },
      });

      if (!data.name) return this.notFound('name');
      if (!data.email) return this.notFound('email');

      return this.ok({ name: data.name, email: data.email });
    } catch (error) {
      return this.invalidData('github');
    }
  }

  public async google(code: IServices.Oauth.TCode) {
    const { google } = this.configService.get.oauth;

    const url = `https://oauth2.googleapis.com/token?client_id=${google.clientId}&client_secret=${google.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${google.redirectUri}`;

    try {
      const response = await axios.post(url);

      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });

      if (!data.name) return this.notFound('name');
      if (!data.email) return this.notFound('email');

      return this.ok({ name: data.given_name, email: data.email });
    } catch (error) {
      return this.invalidData('google');
    }
  }

  private notFound(field: string) {
    return this.responseService.responseFromService({
      data: null,
      errors: { [field]: `The service did not provide us with your ${field}.` },
      message: `User ${field} not found.`,
      responseType: this.responseType.NOT_FOUND,
      success: false,
    });
  }

  private invalidData(type: IServices.Oauth.TTypeOauthLogin) {
    return this.responseService.responseFromService({
      data: null,
      success: false,
      errors: null,
      message: `Failed to get user data from oauth ${type}`,
      responseType: this.responseType.INVALID_DATA,
    });
  }

  private ok(data: IServices.Oauth.IDataFromOauth) {
    return this.responseService.responseFromService({
      data,
      errors: null,
      message: '',
      responseType: this.responseType.OK,
      success: true,
    });
  }
}
