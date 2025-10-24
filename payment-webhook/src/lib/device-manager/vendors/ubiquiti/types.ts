// Onu
export interface Onu {
  authorized?:      boolean;
  bom?:             string;
  connected:        boolean;
  connectionTime?:  number;
  distance?:        number;
  error?:           string;
  experience?:      number;
  firmwareHash?:    string;
  firmwareVersion?: string;
  laserBias?:       number;
  mac?:             string;
  oltPort?:         number;
  ports?:           Port[];
  portsStat?:       Statistics[];
  rebootReason?:    RebootReason;
  router?:          Router;
  rxPower?:         number;
  rxPowerRange?:    RxPowerRange;
  serial:           string;
  ssid?:            string;
  statistics?:      Statistics;
  system?:          System;
  txPower?:         number;
  upgradeStatus?:   UpgradeStatus;
  dyingGasp?:       string;
  name?:       string;
}

export interface Port {
  id:      string;
  plugged: boolean;
  speed:   Speed;
}

export enum Speed {
  Auto = "auto",
  Gigabit = "1000-full",
  Fast = "100-full",
}

export interface Statistics {
  rxBytes: number;
  rxRate:  number;
  txBytes: number;
  txRate:  number;
}

export enum RebootReason {
  Cb = "CB",
  Ur = "UR",
}

export interface Router {
  lanAddress6?: string;
  wanAddress?:  string;
  wanAddress6?: string;
}

export enum RxPowerRange {
  Ok = "ok",
  TooWeak = "too-weak",
}

export interface System {
  cpu:         number;
  mem:         number;
  temperature: Temperature;
  uptime:      number;
  voltage:     number;
}

export interface Temperature {
  cpu: number;
}

export interface UpgradeStatus {
  failureReason: string;
  status:        Status;
}

export enum Status {
  Finished = "finished",
}

// Onu Settings
export interface OnuSettings {
  adminPassword:   string;
  bandwidthLimit:  BandwidthLimit;
  bridgeMode:      BridgeMode;
  country:         string;
  countryListId:   string;
  enabled:         boolean;
  lanAddress:      string;
  lanProvisioned:  boolean;
  mode:            string;
  model:           string;
  name:            string;
  notes:           string;
  ports:           OnuSettingsPort[];
  routerMode:      RouterMode;
  serial:          string;
  services:        Services;
  subsystemID:     string;
  wifi:            Wifi;
  wifiProvisioned: boolean;
}

export interface BandwidthLimit {
  download: Load;
  upload:   Load;
}

export interface Load {
  enabled: boolean;
  limit:   number;
}

export interface BridgeMode {
  ports: BridgeModePort[];
}

export interface BridgeModePort {
  includeVLANs: any[];
  nativeVLAN:   number;
  port:         string;
}

export interface OnuSettingsPort {
  id:    string;
  speed: string;
}

export interface RouterMode {
  dhcpLeaseTime:       number;
  dhcpPool:            DHCPPool;
  dhcpRelay:           string;
  dhcpServerMode:      string;
  dnsProxyEnabled:     boolean;
  dnsResolvers:        string[];
  firewallEnabled6:    boolean;
  gateway:             string;
  gateway6:            string;
  ipv6Enabled:         boolean;
  lanAddress6:         string;
  lanMode6:            string;
  nat:                 Nat;
  portForwards:        any[];
  pppoeMode:           string;
  pppoePassword:       string;
  pppoeUser:           string;
  routerAdvertisement: RouterAdvertisement;
  upnpEnabled:         boolean;
  wanAccessBlocked:    boolean;
  wanAddress:          string;
  wanAddress6:         string;
  wanDnsResolvers:     any[];
  wanMode:             string;
  wanMode6:            string;
  wanVLAN:             number;
}

export interface DHCPPool {
  rangeStart: string;
  rangeStop:  string;
}

export interface Nat {
  ftp:  boolean;
  pptp: boolean;
  rtsp: boolean;
  sip:  boolean;
}

export interface RouterAdvertisement {
  mode:   string;
  prefix: string;
}

export interface Services {
  httpPort:             number;
  sshEnabled:           boolean;
  sshPort:              number;
  telnetEnabled:        boolean;
  telnetPort:           number;
  ubntDiscoveryEnabled: boolean;
}

export interface Wifi {
  channel:      string;
  channelWidth: string;
  enabled:      boolean;
  networks:     Network[];
  txPower:      number;
}

export interface Network {
  authMode: string;
  hideSSID: boolean;
  key:      string;
  ssid:     string;
}
