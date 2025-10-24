import UbiquitiOlt from '../vendors/ubiquiti/olt.js';
import TpLinkOlt from '../vendors/tplink/olt.js';
import { Device } from '../types/device.js';
type DeviceController = UbiquitiOlt | TpLinkOlt;
export declare class DeviceManager {
    private deviceController;
    private device;
    constructor(device: Device);
    connect(): Promise<DeviceController | null>;
}
export {};
