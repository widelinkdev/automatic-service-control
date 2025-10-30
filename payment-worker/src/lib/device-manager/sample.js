import { DeviceManager } from "./sdk/device_manager.js";
const device = {
    id: 1,
    name: 'Node X: OLT',
    type: 'UF-OLT-4',
    url: 'https://10.40.0.194',
    username: 'ubnt',
    password: 'pass',
};
const device2 = {
    id: 1,
    name: 'Node X: OLT TpLink',
    type: 'DS-P7001-08',
    url: 'https://10.40.0.193',
    username: 'admin',
    password: 'victor2030*',
};
const olt = await new DeviceManager(device2).connect();
const onus = olt && await olt.onus.all();
const enabled = olt && await olt.onus.enable('9c:a2:f4:6c:66:ea');
console.log(enabled);
console.log(onus);
//# sourceMappingURL=sample.js.map