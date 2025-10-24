import TpLinkHttpClient from './client.js';
import TpLinkOnus from './onu.js';
class TpLinkOlt {
    device;
    client;
    constructor(device) {
        this.device = device;
        this.client = new TpLinkHttpClient(device.url);
    }
    async connect() {
        await this.client.login(this.device.username, this.device.password);
        return this;
    }
    async disconnect() {
        await this.client.logout();
        return this;
    }
    get onus() {
        return new TpLinkOnus(this.client);
    }
}
export default TpLinkOlt;
//# sourceMappingURL=olt.js.map