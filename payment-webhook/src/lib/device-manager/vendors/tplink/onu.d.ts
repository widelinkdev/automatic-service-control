import { BaseOnu } from 'types/onu.js';
import TpLinkHttpClient from './client.js';
import { MacTableItem } from './types.js';
import { Onu } from './types.js';
declare class TpLinkOnus {
    private client;
    constructor(client: TpLinkHttpClient);
    enable(serial: string): Promise<Onu>;
    disable(serial: string): Promise<Onu>;
    private findOnuKey;
    allWithoutMac(): Promise<Onu[]>;
    macTable(): Promise<MacTableItem[]>;
    all(): Promise<BaseOnu[]>;
    private transformOnu;
    findKeyByMacAddress(mac: string): Promise<string | null>;
}
export default TpLinkOnus;
