import UbiquitiHttpClient from './client.js';
import UbiquitiOnus from './onu.js';
class UbiquitiOlt {
    device;
    client;
    constructor(device) {
        this.device = device;
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
//# sourceMappingURL=olt.js.map