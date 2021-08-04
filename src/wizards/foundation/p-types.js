export const pTypesGSESMV = [
  "MAC-Address",
  "APPID",
  "VLAN-ID",
  "VLAN-PRIORITY"
];
export const typeNullable = {
  "MAC-Address": false,
  APPID: false,
  "VLAN-ID": true,
  "VLAN-PRIORITY": true
};
export const typePattern = {
  "MAC-Address": "([0-9A-F]{2}-){5}[0-9A-F]{2}",
  APPID: "[0-9A-F]{4}",
  "VLAN-ID": "[0-9A-F]{3}",
  "VLAN-PRIORITY": "[0-7]"
};
