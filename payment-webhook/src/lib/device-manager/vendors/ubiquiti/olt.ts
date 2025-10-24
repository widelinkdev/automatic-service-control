import { Device } from 'types/device.js';
import UbiquitiHttpClient from './client.js';
import UbiquitiOnus from './onu.js';

class UbiquitiOlt {
  private client: UbiquitiHttpClient;

  constructor(private device: Device) {
    this.client = new UbiquitiHttpClient(device.url);
  }

  async connect() {
    await this.client.login(this.device.username, this.device.password);
    return this;
  }

  async disconnect() {
    return this.client.login(this.device.username, this.device.password);
  }

  get onus() {
    return new UbiquitiOnus(this.client);
  }
}

export default UbiquitiOlt;
