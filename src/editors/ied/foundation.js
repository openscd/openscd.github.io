import {getNameAttribute} from "../../foundation.js";
export function findElement(ancestors, tagName) {
  return ancestors.find((element) => element.tagName === tagName) ?? null;
}
export function findLogicaNodeElement(ancestors) {
  let element = findElement(ancestors, "LN0");
  if (!element) {
    element = findElement(ancestors, "LN");
  }
  return element;
}
export function findDOTypeElement(element) {
  if (element && element.hasAttribute("type")) {
    const type = element.getAttribute("type");
    return element.closest("SCL").querySelector(`:root > DataTypeTemplates > DOType[id="${type}"]`);
  }
  return null;
}
export function getInstanceDAElement(parentInstance, da) {
  if (parentInstance) {
    const daName = getNameAttribute(da);
    const bType = da.getAttribute("bType");
    if (bType == "Struct") {
      return parentInstance.querySelector(`:scope > SDI[name="${daName}"]`);
    }
    return parentInstance.querySelector(`:scope > DAI[name="${daName}"]`);
  }
  return null;
}
export function getValueElement(element) {
  return element.querySelector("Val");
}
