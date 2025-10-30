import { Client } from "types/client.js";

/**
 * Groups customers by their "billing date" ("fecha de corte") attribute.
 * The keys in the returned Map are numbers (1-31).
 * @param customers - An array of `Client` objects to group.
 * @returns A `Map<number, Client[]>` where:
 * - The keys are numbers representing the "billing date" values (1-31).
 * - The values are arrays of `Client` objects that have the corresponding "billing date".
 */
export const groupByBillingDate = (customers: Client[]): Map<number, Client[]> => {
  const grouped = new Map<number, Client[]>();

  customers.forEach(customer => {
    const fechaDeCorteAttr = customer.attributes.find(
      (attr: any) => attr.key === "fechaDeCorte"
    );
    const fechaDeCorteStr = fechaDeCorteAttr ? fechaDeCorteAttr.value : null;
    const fechaDeCorte = fechaDeCorteStr ? parseInt(fechaDeCorteStr, 10) : NaN;

    if (isNaN(fechaDeCorte) || fechaDeCorte < 1 || fechaDeCorte > 31) {
      throw new Error(`Invalid "fecha de corte" value: ${fechaDeCorteStr}`);
    }

    if (!grouped.has(fechaDeCorte)) {
      grouped.set(fechaDeCorte, []);
    }
    grouped.get(fechaDeCorte)?.push(customer);
  });

  return grouped;
};

/**
 * Filters customers by a specific billing date ("fecha de corte").
 * @param customers - Array of customers to filter.
 * @param billingDate - The specific billing date (1-31) to filter by.
 * @returns Array of customers with the specified billing date.
 */
export const filterByBillingDate = (customers: Client[], billingDate: number): Client[] => {
  if (billingDate < 1 || billingDate > 31) {
    throw new Error(`Invalid billing date: ${billingDate}. Must be between 1 and 31.`);
  }

  return customers.filter((customer) => {
    const billingDateAttr = customer.attributes.find(
      (attr) => attr.key === "fechaDeCorte"
    );
    const customerDueDate = billingDateAttr ? parseInt(billingDateAttr.value, 10) : NaN;

    return customerDueDate === billingDate;
  });
};

/**
 * Filters customers with a negative account balance.
 * @param customers - Array of customers to filter.
 * @returns Array of customers with negative account balance.
 */
export const filterDebtors = (customers: Client[]): Client[] => {
  return customers.filter((customer) => customer.accountBalance < 0);
};

/**
 * Filters customers with a negative account balance for a given "fecha de corte".
 * @param customers - Array of customers to filter.
 * @param billingDate - The "fecha de corte" (1-31) to filter by.
 * @returns Array of customers with negative account balance for the given "fecha de corte".
 */
export const filterDebtorsByBillingDate = (customers: Client[], billingDate: number): Client[] => {
  const debtors = filterDebtors(customers || []);

  return filterByBillingDate(debtors || [], billingDate);
};

/**
 * Extracts the ONU `serial` and `mac` attributes from an array of customers.
 * @param customers - Array of `Client` objects.
 * @returns An array of objects containing `serial` and `mac` attributes for each customer.
 */
export const getCustomerOnuDetails = (customers: Client[]): { serial: string | null; mac: string | null }[] => {
  return customers.map((customer) => {
    const serialAttr = customer.attributes.find((attr) => attr.key === "serial");
    const macAttr = customer.attributes.find((attr) => attr.key === "mac");

    return {
      id: customer.id,
      serial: serialAttr ? serialAttr.value : null,
      mac: macAttr ? macAttr.value : null,
    };
  });
};

/**
 * Retrieves a list of ONU devices (with `serial` and `mac`) for customers
 * with a negative account balance on a specific billing date.
 *
 * @param customers - Array of `Client` objects to filter.
 * @param billingDate - The specific billing date (1-31) to filter by.
 * @returns An array of objects containing `serial` and `mac` for each customer's ONU.
 *
 * @throws Will throw an error if the billing date is invalid (not between 1 and 31).
 */
export const getOnuDevicesForDebtors = (
  customers: Client[],
  billingDate: number
): { serial: string | null; mac: string | null }[] => {
  // Filter customers with negative account balance for the given billing date
  const debtorsOnBillingDate = filterDebtorsByBillingDate(customers, billingDate);

  // Extract ONU details (serial and mac) for the filtered customers
  const onuDisableList = getCustomerOnuDetails(debtorsOnBillingDate);

  return onuDisableList;
};
