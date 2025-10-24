import { createCustomersApi } from './create-clients-api.js'
import { createInvoicesApi } from './create-invoices-api.js'
import { createUispClient } from './create-uisp-client.js'

export function createUispApi(
  url: string,
  key: string,
  opts?: Record<string, any>,
) {
  const client = createUispClient(url, key, opts)

  return {
    invoices: createInvoicesApi(client),
    customers: createCustomersApi(client),
    services: null,
    service_plans: null,
    payments: null,
    products: null,
  }
}
