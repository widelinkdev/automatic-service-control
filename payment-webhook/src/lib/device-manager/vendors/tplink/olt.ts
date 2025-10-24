import { Device } from 'types/device.js';
import TpLinkHttpClient from './client.js';
import TpLinkOnus from './onu.js';

class TpLinkOlt {
  private client: TpLinkHttpClient;

  constructor(private device: Device) {
    this.client = new TpLinkHttpClient(device.url);
  }

  async connect() {
    await this.client.login(this.device.username, this.device.password);
    return this;
  }

  async disconnect() {
    await this.client.logout();
    return this;
  }

  get onus() {
    return new TpLinkOnus(this.client);
  }
}

export default TpLinkOlt;
