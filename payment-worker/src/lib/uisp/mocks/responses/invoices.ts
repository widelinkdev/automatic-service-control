export const paidInvoices = [
  {
    id: 2,
    status: 3,
  },
  {
    id: 3,
    status: 3,
  },
]

export const draftInvoices = [
  {
    id: 1,
    status: 0,
  },
  {
    id: 4,
    status: 0,
  },
]

export const singleInvoice = [
  {
    id: 1,
    status: 3,
  },
]

export const allInvoices = [...paidInvoices, ...draftInvoices]
