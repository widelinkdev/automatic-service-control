// import { DeviceManager } from "./index.js";
import { DeviceManager } from "./sdk/device_manager.js";

const device = {
  id: 1,
  name: 'Node X: OLT',
  type: 'UF-OLT-4',
  url: 'https://10.40.0.194',
  username: 'ubnt',
  password: 'pass',
}

const device2 = {
  id: 1,
  name: 'Node X: OLT TpLink',
  type: 'DS-P7001-08',
  url: 'https://10.40.0.193',
  username: 'admin',
  password: 'victor2030*',
}

const device3 = {
  id: 1,
  name: 'UF-OLT-4',
  type: 'UBNT',
  url: 'https://10.40.3.4',
  username: 'ubnt',
  password: 'victor2030',
}

const olt = await new DeviceManager(device3).connect();

const onus = olt && await olt.onus.all();

const enabled = olt && await olt.onus.enable('UBNT9a060cea');
console.log(enabled);

// console.log(onus);