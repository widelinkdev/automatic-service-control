import UbiquitiOlt from '../vendors/ubiquiti/olt.js';
import TpLinkOlt from '../vendors/tplink/olt.js';
export class DeviceManager {
    deviceController = null;
    device = null;
    constructor(device) {
        this.device = device;
    }
    async connect() {
        switch (this.device?.type) {
            case 'UF-OLT-4':
                this.deviceController = new UbiquitiOlt(this.device);
                break;
            case 'TPLink':
                this.deviceController = new TpLinkOlt(this.device);
                break;
            case 'DS-P7001-08':
                this.deviceController = new TpLinkOlt(this.device);
                break;
            default:
                throw new Error(`Unsupported device type: ${this.device?.type}`);
        }
        await this.deviceController.connect();
        return this.deviceController;
    }
}
//# sourceMappingURL=device_manager.js.map