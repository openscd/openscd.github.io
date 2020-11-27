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
  CTR: "Current Transformer",
  VTR: "Voltage Transformer",
  GEN: "Genarator",
  CAP: "Capacitor Bank",
  REA: "Reactor",
  CON: "Converter",
  MOT: "Motor",
  FAN: "Fan",
  PMP: "Pump",
  EFN: "Earth Fault Neutralizer",
  PSH: "Power Shunt",
  AXN: "Auxiliary Network",
  BAT: "Battery",
  BSH: "Bushing",
  CAB: "Power Cable",
  GIL: "Gas Insulated Line",
  LIN: "Power Overhead Line",
  RES: "Neutral Resistor",
  RRC: "Rotating Reactive Component",
  SAR: "Surge Arrester",
  SCR: "Semiconductor Controlled Rectifier",
  SMC: "Synchronous Machine",
  TCF: "Thyristor Controlled Frequency Converter",
  TCR: "Thyristor Controlled Reactive Component",
  IFL: "Infeeding Line",
  ERS: "Earth Switch"
};
