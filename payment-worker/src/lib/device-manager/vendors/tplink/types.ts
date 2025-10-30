// Onu
export interface Onu {
  key:                       string;
  port_id:                   number;
  onu_id:                    number;
  onu_description:           string;
  serial_number:             string;
  line_profile_id:           number;
  service_profile_id:        number;
  online_status:             number;
  active_status:             number;
  last_down_cause?:          LastDownCause;
  admin_status:              number;
  config_status:             number;
  match_status:              number;
  received_optical_power:    number;
  transmitted_optical_power: number;
  srvport_profile_id?:       number;
  mgmt_profile_id?:          number;
}

export enum LastDownCause {
  DyingGasp = "Dying-gasp.",
  Empty = "--",
  LOFi = "LOFi.",
  LOSi = "LOSi.",
}

// Mac Addresses
export interface MacTableItem {
  mac:    string;
  port:   string;
  vlanId: number;
  type:   number;
  status: number;
  key:    string;
  onu?:   number;
  gem?:   number;
}