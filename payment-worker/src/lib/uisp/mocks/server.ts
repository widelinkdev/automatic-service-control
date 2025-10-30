import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import {
  allInvoices,
  draftInvoices,
  paidInvoices,
  singleInvoice,
} from './responses/invoices.js'

export const restHandlers = [
  http.get('https://uisp.com/invoices', ({ request }) => {
    const url = new URL(request.url)

    const status = url.searchParams.get('statuses[]')

    if (status === '0') {
      return HttpResponse.json(draftInvoices)
    } else if (status === '3') {
      return HttpResponse.json(paidInvoices)
    }
    return HttpResponse.json(allInvoices)
  }),
  http.get('https://uisp.com/invoices/*', () => {
    return HttpResponse.json(singleInvoice)
  }),
  http.patch('https://uisp.com/invoices/:id/approve', ({ params }) => {
    const { id } = params
    const invoice = allInvoices.find((invoice) => invoice.id === Number(id))

    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return HttpResponse.json({ id: invoice.id })
  }),
]

export const server = setupServer(...restHandlers)
