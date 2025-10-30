/**
 * Type alias for ISO format date strings
 */
export type ISODateString = string;

export interface WompiEvent {
  _id: ID;
  event: string;
  environment: string;
  data: WompiEventData;
  signature: WompiEventSignature;
  timestamp: number;
  sent_at: ISODateString;
  __v: number;
}

export interface ID {
  $oid: string;
}

export interface WompiEventData {
  transaction: WompiTransaction;
}

export interface WompiTransaction {
  id: string;
  created_at: ISODateString;
  finalized_at: ISODateString;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: PaymentMethod;
  status: string;
  status_message: null | string;
  shipping_address: null;
  redirect_url: string;
  payment_source_id: null;
  payment_link_id: null;
  customer_data: CustomerData;
  billing_data: BillingData | null;
}

export interface BillingData {
  legal_id_type: string;
  legal_id: string;
}

export interface CustomerData {
  device_id?: string;
  full_name: string;
  browser_info?: BrowserInfo;
  phone_number: string;
  device_data_token?: string;
}

export interface BrowserInfo {
  browser_tz: string;
  browser_language: string;
  browser_user_agent: string;
  browser_color_depth: string;
  browser_screen_width: string;
  browser_screen_height: string;
}

export interface PaymentMethod {
  type: string;
  extra: Extra;
  user_type?: number | string;
  afe_decision?: string;
  payment_description?: string;
  token?: string;
  installments?: number;
  user_legal_id?: string;
  user_legal_id_type?: string;
  phone_number?: string;
  financial_institution_code?: string;
}

export interface Extra {
  is_three_ds?: boolean;
  transfer_date?: string;
  transfer_voucher?: string;
  async_payment_url?: string;
  three_ds_auth_type?: null;
  external_identifier: string;
  bin?: string;
  name?: string;
  brand?: string;
  exp_year?: string;
  card_type?: string;
  exp_month?: string;
  last_four?: string;
  card_holder?: string;
  unique_code?: string;
  processor_response_code?: string;
  authorizer_transaction_id?: string;
  subpayment_method?: string;
  business_agreement_code?: string;
  payment_intention_identifier?: string;
  payment_request_unique_identifier?: string;
  url?: string;
  steps?: string[];
  url_services?: URLServices;
  daviplata_transaction_id?: string;
  qr_id?: string;
  qr_image?: string;
  transaction_id?: string;
  nequi_transaction_id?: string;
  email?: string;
  pseURL?: string;
  address?: string;
  fullName?: string;
  ticketId?: number;
  userType?: string;
  vatValue?: number;
  ticket_id?: string;
  vat_value?: string;
  entityCode?: string;
  returnCode?: string;
  serviceNIT?: string;
  entity_code?: string;
  paymentMode?: number;
  return_code?: string;
  serviceCode?: string;
  serviceName?: string;
  errorDetails?: null;
  request_date?: ISODateString;
  soliciteDate?: ISODateString;
  paymentOrigin?: number;
  authorizationID?: string;
  bankProcessDate?: ISODateString;
  cellphoneNumber?: string;
  trazabilityCode?: string;
  referenceNumber1?: string;
  referenceNumber2?: string;
  referenceNumber3?: string;
  transactionCycle?: number;
  transactionState?: string;
  transactionValue?: number;
  traceability_code?: string;
  transaction_cycle?: string;
  transaction_state?: string;
  transaction_value?: string;
  identificationType?: string;
  paymentDescription?: string;
  bank_processing_date?: ISODateString;
  identificationNumber?: string;
  financialInstitutionCode?: string;
  financial_institution_name?: string;
}

export interface URLServices {
  token: string;
  code_otp_send: string;
  code_otp_validate: string;
}

export interface WompiEventSignature {
  properties: string[];
  checksum: string;
}

export type PaymentEventPayload = {
  clientId: number;
  amount: number;
}
