import {get} from "../../../web_modules/lit-translate.js";
import {
  disconnectorIcon,
  circuitBreakerIcon,
  currentTransformerIcon,
  earthSwitchIcon,
  generalConductingEquipmentIcon,
  voltageTransformerIcon
} from "../../icons.js";
function typeStr(condEq) {
  return condEq.getAttribute("type") === "DIS" && condEq.querySelector("Terminal")?.getAttribute("cNodeName") === "grounded" ? "ERS" : condEq.getAttribute("type") ?? "";
}
export function typeIcon(condEq) {
  return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}
export function typeName(condEq) {
  return types[typeStr(condEq)] ?? get("conductingequipment.unknownType");
}
const typeIcons = {
  CBR: circuitBreakerIcon,
  DIS: disconnectorIcon,
  CTR: currentTransformerIcon,
  VTR: voltageTransformerIcon,
  ERS: earthSwitchIcon
};
export const types = {
  CBR: "Circuit Breaker",
  DIS: "Disconnector",
  ERS: "Earth Switch",
  CTR: "Current Transformer",
  VTR: "Voltage Transformer",
  AXN: "Auxiliary Network",
  BAT: "Battery",
  BSH: "Bushing",
  CAP: "Capacitor Bank",
  CON: "Converter",
  EFN: "Earth Fault Neutralizer",
  FAN: "Fan",
  GIL: "Gas Insulated Line",
  GEN: "Genarator",
  IFL: "Infeeding Line",
  MOT: "Motor",
  RES: "Neutral Resistor",
  REA: "Reactor",
  PSH: "Power Shunt",
  CAB: "Power Cable",
  PMP: "Pump",
  LIN: "Power Overhead Line",
  RRC: "Rotating Reactive Component",
  SCR: "Semiconductor Controlled Rectifier",
  SAR: "Surge Arrester",
  SMC: "Synchronous Machine",
  TCF: "Thyristor Controlled Frequency Converter",
  TCR: "Thyristor Controlled Reactive Component"
};
