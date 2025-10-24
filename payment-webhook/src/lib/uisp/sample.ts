// import { getOnuDevicesForDebtors, getCustomerOnuDetails } from 'utilities/clients.js'
// import { Client, UISP } from './index.js'

// const url = 'https://widelink.uisp.com/crm/api/v1.0/'
// const apiKey =
//   'Qt1d03302Q8GNTv7EEAjSpJQiBuFrIVrqBkxw7wrHN19qM0Lmx4Lhq+RkMhVRbaj'

// // UISP Client
// const uisp = await new UISP(url, apiKey)

// // Get Invoices
// // const drafInvoices = await uisp.invoices.get('draft');

// // Get Customer
// const customer = await uisp.customers.get(459) as Client[]
// // const customer = await uisp.customers.get(459);

// const onuDisableList = getOnuDevicesForDebtors(customer, 5) // Pass dueDate as a number

// // console.log(drafInvoices);
// // console.log(customer)
// // console.log(onuDisableList)

import { getOnuDevicesForDebtors, getCustomerOnuDetails } from './utilities/clients.js';
import { Client, UISP } from './index.js';

async function main() {
  const url = 'https://widelink.uisp.com/crm/api/v1.0/'
  const apiKey = 'Qt1d03302Q8GNTv7EEAjSpJQiBuFrIVrqBkxw7wrHN19qM0Lmx4Lhq+RkMhVRbaj'

  // UISP Client
  const uisp = new UISP(url, apiKey)

  // Get Customer
  const customer = await uisp.customers.get(450) as Client[]

  const customers = [customer]
  
  // Obtener detalles de ONU (serial y mac)
  const onuDetails = getCustomerOnuDetails(customers)
  
  // console.log("Customer:", customer)
  console.log("ONU Details:", onuDetails)  

  // console.log("Tipo de customers:", Array.isArray(customer), customer);
  const onuDisableList = getOnuDevicesForDebtors(customer, 5)

  console.log(customer)
  console.log(onuDisableList)
}

main().catch(console.error)
