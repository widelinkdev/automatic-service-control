import { Device } from 'types/device.js';
import UbiquitiOnus from './onu.js';
declare class UbiquitiOlt {
    private device;
    private client;
    constructor(device: Device);
    connect(): Promise<this>;
    disconnect(): Promise<void>;
    get onus(): UbiquitiOnus;
}
export default UbiquitiOlt;
