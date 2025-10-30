import { Device } from 'types/device.js';
import TpLinkOnus from './onu.js';
declare class TpLinkOlt {
    private device;
    private client;
    constructor(device: Device);
    connect(): Promise<this>;
    disconnect(): Promise<this>;
    get onus(): TpLinkOnus;
}
export default TpLinkOlt;
