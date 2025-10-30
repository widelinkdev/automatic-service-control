import { isMacAddress } from '../../sdk/utils.js';
class TpLinkOnus {
    client;
    constructor(client) {
        this.client = client;
    }
    async enable(serial) {
        const key = await this.findOnuKey(serial);
        const response = await this.client.post('data/PON/onuList.json', {
            operation: 'activate',
            key: [key],
        });
        if (response.success) {
            return response.data;
        }
        else {
            throw new Error('Failed to enable ONU');
        }
    }
    async disable(serial) {
        const key = await this.findOnuKey(serial);
        const response = await this.client.post('data/PON/onuList.json', {
            operation: 'deactivate',
            key: [key],
        });
        if (response.success) {
            return response;
        }
        else {
            throw new Error('Failed to enable ONU');
        }
    }
    async findOnuKey(serial) {
        const onusWithMac = await this.all();
        const onus = await this.allWithoutMac();
        const onuId = onusWithMac.find(onu => onu.serial === serial || onu.mac === serial)?.onuId;
        const key = onus.find(onu => onu.onu_id === parseInt(onuId ?? ''))?.key;
        if (!key) {
            throw new Error(`ONU with serial ${serial} not found`);
        }
        return key;
    }
    async allWithoutMac() {
        const response = await this.client.post('data/PON/onuList.json', {
            operation: 'load',
            port: 'PON 1/0/1-8'
        });
        if (response.success) {
            return response.data;
        }
        else {
            throw new Error('Failed to get ONU list');
        }
    }
    async macTable() {
        const response = await this.client.post('data/swtMacTableCfg.json', {
            operation: 'load',
        });
        if (response.success) {
            return response.data;
        }
        else {
            throw new Error('Failed to get MAC table');
        }
    }
    async all() {
        const onus = await this.allWithoutMac();
        const macTable = await this.macTable();
        return onus.map(onu => {
            const mac = macTable.find(item => item.onu === onu.onu_id);
            return {
                ...(this.transformOnu(onu)),
                mac: (mac?.mac)?.toLowerCase().replace(/-/g, ':') || '',
            };
        });
    }
    transformOnu(onu) {
        return {
            onuId: onu.onu_id.toString(),
            oltPort: onu.port_id,
            name: onu.onu_description,
            authorized: onu.active_status === 1,
            connected: onu.online_status === 1,
            serial: onu.serial_number,
            connectionTime: onu.active_status === 1 ? Date.now() : undefined,
            rxPower: onu.received_optical_power,
            txPower: onu.transmitted_optical_power,
            dyingGasp: onu.last_down_cause === 'Dying-gasp.',
        };
    }
    async findKeyByMacAddress(mac) {
        if (!isMacAddress(mac)) {
            return null;
        }
        const onus = await this.all();
        const onu = onus.find(onu => onu.mac === mac);
        return onu?.serial ?? null;
    }
}
export default TpLinkOnus;
//# sourceMappingURL=onu.js.map