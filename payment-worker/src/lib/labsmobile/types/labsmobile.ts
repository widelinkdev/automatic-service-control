export interface BalanceResponse {
  code:           number | string;
  credits:        string;
  message:        string;
}

export interface PriceResponse {
  [key: string]: {
    isocode: string;
    prefix:  string;
    name:    string;
    credits: number;
  };
}

export interface PriceErrorResponse {
  code:           number | string;
  message:        string;
}

export interface SendResponse {
  code:           number | string;
  subid:          string;
  message:        string;
}

// https://www.labsmobile.com/en/sms-api/api-versions/http-rest-post-json#send_sms_post
export interface SendRequest {
  message:    string;
  recipient:  Recipient[];
  label:      string;
  test:       string;
  subid?:     string; // Request identifier
  tpoa?:      string; // Sender identifier
  scheduled?: string; // Scheduled date and time YYYYYY-MM-DD HH:MM:SS
  ackurl?:    string; // URL to receive the delivery report
  clickurl?: string;
  shortlink?: string;
  parameters: Parameter[];
}

export interface Parameter {
  [key: string]: {
    msisdn: string;
    value:  string;
  }
}

export interface Recipient {
  msisdn: string;
}