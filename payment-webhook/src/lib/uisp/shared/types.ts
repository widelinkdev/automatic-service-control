export interface IUISPClientContact {
  phone: string;
  email: string;
}

export interface IUISPClientContactAttributes {
  key: string;
  value: string;
}

export interface IUISPClient {
  id: number;
  userIdent: string;
  previousIsp: any;
  isLead: boolean;
  clientType: number;
  companyName: string;
  companyRegistrationNumber: number | null | string;
  companyTaxId: number | null | string;
  companyWebsite: string;
  street1: string;
  street2: string;
  city: string;
  countryId: number;
  stateId: number | null | string;
  zipCode: number | null | string;
  fullAddress: string;
  invoiceStreet1: string;
  invoiceStreet2: string;
  invoiceCity: string;
  invoiceStateId: number | null | string;
  invoiceCountryId: number;
  invoiceZipCode: number | null | string;
  invoiceAddressSameAsContact: boolean;
  note: string;
  sendInvoiceByPost: boolean;
  invoiceMaturityDays: number;
  stopServiceDue: number;
  stopServiceDueDays: number;
  organizationId: number;
  tax1Id: number;
  tax2Id: number;
  tax3Id: number;
  registrationDate: string | null | Date;
  leadConvertedAt: string | null | Date;
  companyContactFirstName: string;
  companyContactLastName: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  username: string;
  contacts: IUISPClientContact[];
  attributes: IUISPClientContactAttributes[];
  accountBalance: number;
  accountCredit: number;
  accountOutstanding: number;
  currencyCode: string;
  organizationName: string;
  bankAccounts: Object;
  tags: Object;
  invitationEmailSentDate: string | null | Date;
  avatarColor: string;
  addressGpsLat: number;
  addressGpsLon: number;
  isArchived: boolean;
  generateProformaInvoices: boolean;
  usesProforma: boolean;
  hasOverdueInvoice: boolean;
  hasOutage: boolean;
  hasSuspendedService: boolean;
  hasServiceWithoutDevices: boolean;
  referral: string | null | number;
}

export interface AlegraContactCreate {
  name: string;
  kindOfPerson: 'PERSON_ENTITY';
  regime: 'SIMPLIFIED_REGIME';
  nameObject: {
    firstName: string;
    lastName: string;
  };
  identificationObject: {
    number: string;
    type: 'CC';
  };
}
