import { BaseOnu } from 'types/onu.js';
import UbiquitiHttpClient from './client.js';
import { OnuSettings } from './types.js';
declare class UbiquitiOnus {
    private client;
    constructor(client: UbiquitiHttpClient);
    enable(serial: string): Promise<OnuSettings>;
    disable(serial: string): Promise<OnuSettings>;
    settingsBySerial(serial: string): Promise<OnuSettings>;
    settings(): Promise<OnuSettings[]>;
    all(): Promise<BaseOnu[]>;
    private transformOnu;
    findSerialByMacAddress(mac: string): Promise<string | null>;
}
export default UbiquitiOnus;
