// import type { BaseHttpClient } from '@widelink/integration-core'

// export function createCustomersApi(client: BaseHttpClient) {
//   async function getArchivedCustomers(): Promise<any> {
//     const params = { 'isArchived': '1' }
//     return client.get('clients', params)
//   }

//   async function getCustomerById(id: number): Promise<any> {
//     return client.get(`clients/${id}`)
//   }

//   async function getCustomers(...args: any[]): Promise<any> {
//     const params = {}
//     return client.get('clients', params)
//   }

//   return {
//     getArchivedCustomers,
//     getCustomerById,
//     getCustomers,
//   }
// }

// src/lib/uisp/api/customers.ts

// Definimos un contrato mínimo para el cliente HTTP
export interface BaseHttpClient {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>
  post?<T = any>(url: string, body: any, config?: Record<string, any>): Promise<T>
  put?<T = any>(url: string, body: any, config?: Record<string, any>): Promise<T>
  delete?<T = any>(url: string, config?: Record<string, any>): Promise<T>
}

export function createCustomersApi(client: BaseHttpClient) {
  async function getArchivedCustomers(): Promise<any> {
    const params = { isArchived: "1" }
    return client.get("clients", params)
  }

  async function getCustomerById(id: number): Promise<any> {
    return client.get(`clients/${id}`)
  }

  async function getCustomers(..._args: any[]): Promise<any> {
    const params = {}
    return client.get("clients", params)
  }

  return {
    getArchivedCustomers,
    getCustomerById,
    getCustomers,
  }
}
