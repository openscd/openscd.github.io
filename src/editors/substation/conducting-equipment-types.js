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
const typeIcons = {
  CBR: circuitBreakerIcon,
  DIS: disconnectorIcon,
  CTR: currentTransformerIcon,
  VTR: voltageTransformerIcon,
  ERS: earthSwitchIcon
};
export function typeIcon(condEq) {
  return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}
