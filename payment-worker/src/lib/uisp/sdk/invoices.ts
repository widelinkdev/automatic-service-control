import { AxiosInstance } from 'axios'
import { Invoice } from 'types/invoice.js'

export default class Invoices {
  constructor(private axios: AxiosInstance) {}

  async get(status: 'draft' | 'paid'): Promise<Invoice[]>
  async get(id: number): Promise<any>
  async get(...args: any[]): Promise<any> {
    let params
    let id: number | undefined
    let status: 'draft' | 'paid' | undefined

    if (args.length === 1) {
      if (typeof args[0] === 'number') {
        id = args[0]
      } else if (typeof args[0] === 'string') {
        status = args[0] as 'draft' | 'paid'
      }
    }

    switch (status) {
      case 'draft':
        params = { 'statuses[]': '0' }
        break
      case 'paid':
        params = { 'statuses[]': '3' }
        break
      default:
        params = undefined
        break
    }

    if (id === undefined) {
      return (await this.axios.get('invoices', { params })).data
    }

    return (await this.axios.get(`invoices/${id}`)).data
  }

  async approve(): Promise<Record<string, any> | number[]> {
    try {
      let approvedInvoices: number[] = []
      const invoices = (await this.get('draft')) || []

      if (invoices.length === 0) {
        return approvedInvoices
      }

      for (const invoice of invoices) {
        const response = (await this.axios.patch(`invoices/${invoice.id}/approve`)).data
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
}
