// Definition of the Base ONU type
export interface BaseOnu {
  onuId:            string;
  oltPort?:         number;
  name:             string;
  authorized:      boolean;
  connected:        boolean;
  mac?:             string;
  serial:           string;
  connectionTime?:  number;
  rxPower?:         number;
  txPower?:         number;
  dyingGasp?:       boolean;
}