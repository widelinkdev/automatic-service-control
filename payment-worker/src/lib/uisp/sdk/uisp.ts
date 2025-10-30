import axios, { AxiosInstance } from 'axios'
import { setupCache } from 'axios-cache-interceptor';
import { createRequire } from 'module'
import Invoices from './invoices.js'
import Clients from './clients.js';

const require = createRequire(import.meta.url);

export class UISP {
  private axios: AxiosInstance

  constructor(url: string, key: string, opts?: { rateLimit?: number }) {
    const axiosInstance = axios.create({
      baseURL: url,
      headers: {
        'X-Auth-App-Key': key,
      }
    })

    const axiosRateLimit = require('axios-rate-limit')
    const instance = axiosRateLimit(axiosInstance, { maxRPS: opts?.rateLimit || 100 })
    this.axios = (setupCache(instance) as unknown) as AxiosInstance;
  }

  get invoices() {
    return new Invoices(this.axios)
  }

  get customers() {
    return new Clients(this.axios)
  }

  get services() {
    return null
  }

  get service_plans() {
    return null
  }

  get payments() {
    return null
  }

  get products() {
    return null
  }
}
