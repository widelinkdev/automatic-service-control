import UbiquitiOlt from '../vendors/ubiquiti/olt.js'
import TpLinkOlt from '../vendors/tplink/olt.js'
import { Device } from '../types/device.js'

type DeviceController = UbiquitiOlt | TpLinkOlt

export class DeviceManager {
  private deviceController: DeviceController | null = null
  private device: Device | null = null

  constructor(device: Device) {
    this.device = device
  }

  async connect(): Promise<DeviceController | null> {
    switch (this.device?.type) {
      case 'UF-OLT-4':
        this.deviceController = new UbiquitiOlt(this.device)
        break
      case 'TPLink':
        this.deviceController = new TpLinkOlt(this.device)
        break
      case 'DS-P7001-08':
        this.deviceController = new TpLinkOlt(this.device)
        break
      default:
        throw new Error(`Unsupported device type: ${this.device?.type}`)
    }

    await this.deviceController.connect()

    return this.deviceController
  }
}
