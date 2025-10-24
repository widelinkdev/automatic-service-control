// import { createHttpClient } from '@widelink/integration-core'

import { createHttpClient } from "../utilities/http-client.ts"

export function createUispClient(
  url: string,
  key: string,
  opts?: Record<string, any>,
) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Auth-App-Key': key,
  }
  const optWithHeaders = { ...opts, headers, encodeURI: true }

  return createHttpClient(url, optWithHeaders)
}
