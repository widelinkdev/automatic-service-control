import { isMacAddress } from '../../sdk/utils.js';
class UbiquitiOnus {
    client;
    constructor(client) {
        this.client = client;
    }
    async enable(serial) {
        const onuSerial = await this.findSerialByMacAddress(serial) ?? serial;
        const currentSettings = await this.settingsBySerial(onuSerial);
        return this.client.put(`api/v1.0/gpon/onus/${serial}/settings`, { ...currentSettings, enabled: true });
    }
    async disable(serial) {
        const onuSerial = await this.findSerialByMacAddress(serial) ?? serial;
        const currentSettings = await this.settingsBySerial(onuSerial);
        return this.client.put(`api/v1.0/gpon/onus/${serial}/settings`, { ...currentSettings, enabled: false });
    }
    async settingsBySerial(serial) {
        return this.client.get(`api/v1.0/gpon/onus/${serial}/settings`);
    }
    async settings() {
        const onuSettings = this.client.get(`api/v1.0/gpon/onus/settings`);
        return this.client.get(`api/v1.0/gpon/onus/settings`);
    }
    async all() {
        const onus = await this.client.get('api/v1.0/gpon/onus');
        const onuSettings = await this.settings();
        const newOnus = onus.map((onu) => {
            const settings = onuSettings.find((settings) => settings.serial === onu.serial);
            const newOnu = {
                ...onu,
                name: settings?.name || '',
            };
            return this.transformOnu(newOnu);
        });
        return newOnus.map((onu) => this.transformOnu(onu));
    }
    transformOnu(onu) {
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
        };
    }
    async findSerialByMacAddress(mac) {
        if (!isMacAddress(mac)) {
            return null;
        }
        const onus = await this.all();
        const onu = onus.find(onu => onu.mac === mac);
        return onu?.serial ?? null;
    }
}
export default UbiquitiOnus;
//# sourceMappingURL=onu.js.map