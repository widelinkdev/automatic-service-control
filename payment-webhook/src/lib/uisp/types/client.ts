export interface Client {
  id: number;
  userIdent: null | string;
  previousIsp: null;
  isLead: boolean;
  clientType: number;
  companyName: null;
  companyRegistrationNumber: null;
  companyTaxId: null;
  companyWebsite: null;
  street1: null | string;
  street2: null | string;
  city: string;
  countryId: number | null;
  stateId: null;
  zipCode: null | string;
  fullAddress: string;
  invoiceStreet1: null;
  invoiceStreet2: null;
  invoiceCity: null;
  invoiceStateId: null;
  invoiceCountryId: null;
  invoiceZipCode: null;
  invoiceAddressSameAsContact: boolean;
  note: null | string;
  sendInvoiceByPost: boolean | null;
  invoiceMaturityDays: null;
  stopServiceDue: boolean | null;
  stopServiceDueDays: null;
  organizationId: number;
  tax1Id: null;
  tax2Id: null;
  tax3Id: null;
  registrationDate: string;
  leadConvertedAt: null;
  companyContactFirstName: null;
  companyContactLastName: null;
  isActive: boolean;
  firstName: string;
  lastName: string;
  username: null | string;
  contacts: Contact[];
  attributes: Attribute[];
  accountBalance: number;
  accountCredit: number;
  accountOutstanding: number;
  currencyCode: string;
  organizationName: string;
  bankAccounts: any[];
  tags: any[];
  invitationEmailSentDate: null | string;
  avatarColor: string;
  addressGpsLat: number;
  addressGpsLon: number;
  isArchived: boolean;
  generateProformaInvoices: boolean | null;
  usesProforma: boolean;
  hasOverdueInvoice: boolean;
  hasOutage: boolean;
  hasSuspendedService: boolean;
  hasServiceWithoutDevices: boolean;
  referral: null | string;
  hasPaymentSubscription: boolean;
  hasAutopayCreditCard: boolean;
}

export interface Attribute {
  id: number;
  clientId: number;
  customAttributeId: number;
  name: string;
  key: string;
  value: string;
  clientZoneVisible: boolean;
}

export interface Contact {
  id: number;
  clientId: number;
  email: null | string;
  phone: null | string;
  name: null;
  isBilling: boolean;
  isContact: boolean;
  types: ContactType[];
}

export interface ContactType {
  id: number;
  name: string;
}

export type UpdateAttribute = Pick<Attribute, 'customAttributeId' | 'value'>;

export type UpdateClientBody = Partial<Omit<Client, 'attributes'>> & {
  attributes?: UpdateAttribute[];
}

export type PaymentEventPayload = {
  clientId: number;
  amount: number;
};
