import {
  draftInvoices,
  paidInvoices,
  singleInvoice,
} from '../mocks/responses/invoices.js'
import { UISP } from './uisp.js'
import Invoices from './invoices.js'

describe('Invoices', () => {
  let invoices: Invoices

  beforeEach(() => {
    const uisp = new UISP('https://uisp.com/', 'uisp-key')
    invoices = uisp.invoices
  })

  it('should get invoices by status', async () => {
    const result1 = await invoices.get('draft')
    const result2 = await invoices.get('paid')

    expect(result1).toEqual(draftInvoices)
    expect(result2).toEqual(paidInvoices)
  })

  it('should get an invoice by id', async () => {
    const result = await invoices.get(1)

    expect(result).toEqual(singleInvoice)
  })

  it('should approve invoices', async () => {
    const approvedInvoices = draftInvoices.map((invoice) => invoice.id)

    const invoiceGetFn = vi.spyOn(invoices, 'get')
    const result = await invoices.approve()

    expect(invoiceGetFn).toHaveBeenCalledTimes(1)
    expect(invoiceGetFn).toHaveBeenCalledWith('draft')
    expect(result).toEqual(approvedInvoices)
  })
})
