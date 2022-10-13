import {getSclSchemaVersion} from "../../../foundation.js";
import {serviceTypes} from "../foundation.js";
export function sameAttributeValue(leftElement, rightElement, attributeName) {
  return (leftElement?.getAttribute(attributeName) ?? "") === (rightElement?.getAttribute(attributeName) ?? "");
}
export function sameAttributeValueDiffName(leftElement, leftAttributeName, rightElement, rightAttributeName) {
  return (leftElement?.getAttribute(leftAttributeName) ?? "") === (rightElement?.getAttribute(rightAttributeName) ?? "");
}
function checkEditionSpecificRequirements(controlTag, controlElement, extRefElement) {
  if (getSclSchemaVersion(extRefElement.ownerDocument) === "2003") {
    return true;
  }
  const lDeviceElement = controlElement?.closest("LDevice") ?? void 0;
  const lnElement = controlElement?.closest("LN0") ?? void 0;
  return (extRefElement.getAttribute("serviceType") ?? "") === serviceTypes[controlTag] && sameAttributeValueDiffName(extRefElement, "srcLDInst", lDeviceElement, "inst") && sameAttributeValueDiffName(extRefElement, "scrPrefix", lnElement, "prefix") && sameAttributeValueDiffName(extRefElement, "srcLNClass", lnElement, "lnClass") && sameAttributeValueDiffName(extRefElement, "srcLNInst", lnElement, "inst") && sameAttributeValueDiffName(extRefElement, "srcCBName", controlElement, "name");
}
export function isSubscribedTo(controlTag, controlElement, fcdaElement, extRefElement) {
  return extRefElement.getAttribute("iedName") === fcdaElement?.closest("IED")?.getAttribute("name") && sameAttributeValue(fcdaElement, extRefElement, "ldInst") && sameAttributeValue(fcdaElement, extRefElement, "prefix") && sameAttributeValue(fcdaElement, extRefElement, "lnClass") && sameAttributeValue(fcdaElement, extRefElement, "lnInst") && sameAttributeValue(fcdaElement, extRefElement, "doName") && sameAttributeValue(fcdaElement, extRefElement, "daName") && checkEditionSpecificRequirements(controlTag, controlElement, extRefElement);
}
export function isSubscribed(extRefElement) {
  return extRefElement.hasAttribute("iedName") && extRefElement.hasAttribute("ldInst") && extRefElement.hasAttribute("prefix") && extRefElement.hasAttribute("lnClass") && extRefElement.hasAttribute("lnInst") && extRefElement.hasAttribute("doName") && extRefElement.hasAttribute("daName");
}
export function getExtRefElements(rootElement, fcdaElement, includeLaterBinding) {
  return Array.from(rootElement.querySelectorAll("ExtRef")).filter((element) => includeLaterBinding && element.hasAttribute("intAddr") || !includeLaterBinding && !element.hasAttribute("intAddr")).filter((element) => element.closest("IED") !== fcdaElement?.closest("IED"));
}
export function getSubscribedExtRefElements(rootElement, controlTag, fcdaElement, controlElement, includeLaterBinding) {
  return getExtRefElements(rootElement, fcdaElement, includeLaterBinding).filter((extRefElement) => isSubscribedTo(controlTag, controlElement, fcdaElement, extRefElement));
}
