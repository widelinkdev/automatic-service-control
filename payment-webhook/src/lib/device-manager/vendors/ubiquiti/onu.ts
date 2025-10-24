import { BaseOnu } from 'types/onu.js';
import UbiquitiHttpClient from './client.js';
import { Onu, OnuSettings } from './types.js';
import { isMacAddress } from '../../sdk/utils.js';

class UbiquitiOnus {
  constructor(private client: UbiquitiHttpClient) {}

  async enable(serial: string): Promise<OnuSettings> {
    const onuSerial = await this.findSerialByMacAddress(serial) ?? serial;
    const currentSettings = await this.settingsBySerial(onuSerial);
    return this.client.put(`api/v1.0/gpon/onus/${serial}/settings`, {...currentSettings, enabled: true});
  }

  async disable(serial: string): Promise<OnuSettings> {
    const onuSerial = await this.findSerialByMacAddress(serial) ?? serial;
    const currentSettings = await this.settingsBySerial(onuSerial);
    return this.client.put(`api/v1.0/gpon/onus/${serial}/settings`, {...currentSettings, enabled: false});
  }

  async settingsBySerial(serial: string): Promise<OnuSettings> {
    return this.client.get(`api/v1.0/gpon/onus/${serial}/settings`);
  }

  async settings(): Promise<OnuSettings[]> {
    const onuSettings = this.client.get(`api/v1.0/gpon/onus/settings`);
    return this.client.get(`api/v1.0/gpon/onus/settings`);
  }

  async all(): Promise<BaseOnu[]> {
    const onus = await this.client.get('api/v1.0/gpon/onus');
    const onuSettings = await this.settings()

    const newOnus = onus.map((onu: Onu) => {
      const settings = onuSettings.find((settings) => settings.serial === onu.serial);
      const newOnu = {
        ...onu,
        name: settings?.name || '',
      }
      return this.transformOnu(newOnu);
    });

    return newOnus.map((onu: Onu) => this.transformOnu(onu));
  }

  private transformOnu(onu: Onu): BaseOnu{
    return {
      onuId: onu.serial,
      oltPort: onu.oltPort,
      name: onu.name ?? '',
      mac: onu.mac ?? '',
      authorized: onu.authorized ?? false,
      connected: onu.connected ?? false,
      serial: onu.serial,
      connectionTime: onu.connectionTime,
      rxPower: onu.rxPower,
      txPower: onu.txPower,
      dyingGasp: onu.dyingGasp === 'yes',
    }
  }

  async findSerialByMacAddress(mac: string): Promise<string | null> {
    if (!isMacAddress(mac)) {
      return null
    }
    const onus = await this.all();
    const onu = onus.find(onu => onu.mac === mac);
    return onu?.serial ?? null;
  }
}

export default UbiquitiOnus;
