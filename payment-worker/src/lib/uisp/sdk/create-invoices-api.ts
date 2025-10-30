// import type { BaseHttpClient } from '@widelink/integration-core'

export interface BaseHttpClient {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>
  post?<T = any>(url: string, body: any, config?: Record<string, any>): Promise<T>
  put?<T = any>(url: string, body: any, config?: Record<string, any>): Promise<T>
  patch?<T = any>(url: string, body?: any, config?: Record<string, any>): Promise<T>
  delete?<T = any>(url: string, config?: Record<string, any>): Promise<T>
}

export function createInvoicesApi(client: BaseHttpClient) {
  async function getDraftInvoices(): Promise<any> {
    const params = { 'statuses[]': '0' }
    return client.get('invoices', params)
  }

  async function getPaidInvoices(): Promise<any> {
    const params = { 'statuses[]': '3' }
    return client.get('invoices', params)
  }

  async function getInvoiceById(id: number): Promise<any> {
    return client.get(`invoices/${id}`)
  }

  async function getInvoices(): Promise<any> {
    const params = {}
    return client.get('invoices', params)
  }

  async function approveDraftInvoices(): Promise<Record<string, any> | number[]> {
    try {
      let approvedInvoices: number[] = []
      const invoices = ((await getDraftInvoices()) as any[]) || []

      if (invoices.length === 0) {
        return approvedInvoices
      }

      for (const invoice of invoices) {

        if (!client.patch) {
          throw new Error("This client does not support PATCH requests")
        }        
        const response = (await client.patch(
          `invoices/${invoice.id}/approve`,
          undefined,
          { id: invoice.id },
        )) as any
        approvedInvoices.push(response.id as number)
      }

      return approvedInvoices
    } catch (error) {
      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message
      return {
        error: {
          message,
        },
      }
    }
  }

  return {
    getDraftInvoices,
    getPaidInvoices,
    getInvoiceById,
    getInvoices,
    approveDraftInvoices,
  }
}
