// import { HttpClient } from '@widelink/integration-core'
import { HttpClient } from "./utilities/http-client.js"

export class UISPClient extends HttpClient {
  constructor(url: string, key: string, opts?: Record<string, any>) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Auth-App-Key': key,
    }
    const optWithHeaders = { ...opts, headers, encodeURI: true }
    super(url, optWithHeaders)
  }
}
