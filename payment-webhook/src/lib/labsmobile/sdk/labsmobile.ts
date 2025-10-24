import Axios, { AxiosInstance } from "axios";
import { BalanceResponse, PriceErrorResponse, PriceResponse, Recipient, SendResponse } from "types/labsmobile.js";

export class LabsMobile {
  private axios: AxiosInstance;

  constructor (private username: string, private token: string) {
    const credentials = Buffer.from(`${this.username}:${this.token}`).toString('base64');

    this.axios = Axios.create({
      baseURL: "https://api.labsmobile.com/",
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });
  }

  public async getCredits(): Promise<BalanceResponse> {
    const response = await this.axios.get(`/json/balance`);

    return response.data;
  }

  public async getPrice(countries: string[] = ['CO'], format: string = 'JSON'): Promise<PriceResponse | PriceErrorResponse> {
    const response = await this.axios.post(`/json/prices`, {
      countries,
      format
    });

    return response.data;
  }

  public async sendSMS(message: string, recipients: string[], options?: object): Promise<SendResponse> {
    const body = {
      message,
      recipient: this.createRecipients(recipients),
      ...options
    }

    const response = await this.axios.post(`/json/send`, body);

    return response.data;
  }

  public async cancelScheduledSend(): Promise<void> {
    // TODO: Implement this method
    // https://www.labsmobile.com/en/sms-api/api-versions/http-rest-post-json#scheduled_sendings
  }

  private createRecipients(recipients: string[]): Recipient[] {
    return recipients.map((recipient) => ({ msisdn: recipient }));
  }

  public async sendOTP(phone_number: string, message: string = 'El codigo para verificar tu numero es %CODE%'): Promise<boolean> {
    const response = await this.axios.get(`/otp/sendCode`, {
      params: {
        phone_number,
        message,
      }
    });

    return response.data === 1;
  }

  public async validateOTP(phone_number: string, code: string): Promise<boolean> {
    const response = await this.axios.get(`/otp/validateCode`, {
      params: {
        phone_number,
        code,
      }
    });

    return response.data === 1;
  }
}
