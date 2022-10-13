import {getSclSchemaVersion} from "../../../foundation.js";
export function sameAttributeValue(leftElement, rightElement, attributeName) {
  return (leftElement?.getAttribute(attributeName) ?? "") === (rightElement?.getAttribute(attributeName) ?? "");
}
export function sameAttributeValueDiffName(leftElement, leftAttributeName, rightElement, rightAttributeName) {
  return (leftElement?.getAttribute(leftAttributeName) ?? "") === (rightElement?.getAttribute(rightAttributeName) ?? "");
}
function checkEditionSpecificRequirements(serviceType, controlElement, extRefElement) {
  if (getSclSchemaVersion(extRefElement.ownerDocument) === "2003") {
    return true;
  }
  const lDeviceElement = controlElement?.closest("LDevice") ?? void 0;
  const lnElement = controlElement?.closest("LN0") ?? void 0;
  return (extRefElement.getAttribute("serviceType") ?? "") === serviceType && sameAttributeValueDiffName(extRefElement, "srcLDInst", lDeviceElement, "inst") && sameAttributeValueDiffName(extRefElement, "scrPrefix", lnElement, "prefix") && sameAttributeValueDiffName(extRefElement, "srcLNClass", lnElement, "lnClass") && sameAttributeValueDiffName(extRefElement, "srcLNInst", lnElement, "inst") && sameAttributeValueDiffName(extRefElement, "srcCBName", controlElement, "name");
}
export function isSubscribedTo(serviceType, iedElement, controlElement, fcdaElement, extRefElement) {
  return extRefElement.getAttribute("iedName") === iedElement?.getAttribute("name") && sameAttributeValue(fcdaElement, extRefElement, "ldInst") && sameAttributeValue(fcdaElement, extRefElement, "prefix") && sameAttributeValue(fcdaElement, extRefElement, "lnClass") && sameAttributeValue(fcdaElement, extRefElement, "lnInst") && sameAttributeValue(fcdaElement, extRefElement, "doName") && sameAttributeValue(fcdaElement, extRefElement, "daName") && checkEditionSpecificRequirements(serviceType, controlElement, extRefElement);
}
