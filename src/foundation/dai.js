import {SCL_NAMESPACE} from "../schemas.js";
export function determineUninitializedStructure(parentElement, templateStructure) {
  const templateElement = templateStructure.shift();
  if (templateStructure.length > 0) {
    let instanceElement;
    if (templateElement.tagName === "DO") {
      instanceElement = parentElement.querySelector(`DOI[name="${templateElement.getAttribute("name")}"]`);
    } else {
      instanceElement = parentElement.querySelector(`SDI[name="${templateElement.getAttribute("name")}"]`);
    }
    if (instanceElement) {
      return determineUninitializedStructure(instanceElement, templateStructure);
    } else {
      templateStructure.unshift(templateElement);
      return [parentElement, templateStructure];
    }
  } else {
    return [parentElement, [templateElement]];
  }
}
export function initializeElements(uninitializedTemplateStructure) {
  const element = uninitializedTemplateStructure.shift();
  if (uninitializedTemplateStructure.length > 0) {
    let newElement;
    if (element.tagName === "DO") {
      newElement = element.ownerDocument.createElementNS(SCL_NAMESPACE, "DOI");
    } else {
      newElement = element.ownerDocument.createElementNS(SCL_NAMESPACE, "SDI");
    }
    newElement.setAttribute("name", element?.getAttribute("name") ?? "");
    const childElement = initializeElements(uninitializedTemplateStructure);
    newElement.append(childElement);
    return newElement;
  } else {
    const newValElement = element.ownerDocument.createElementNS(SCL_NAMESPACE, "Val");
    const valElement = element.querySelector("Val");
    if (valElement) {
      newValElement.textContent = valElement.textContent;
    }
    const daiElement = element.ownerDocument.createElementNS(SCL_NAMESPACE, "DAI");
    daiElement.setAttribute("name", element?.getAttribute("name") ?? "");
    daiElement.append(newValElement);
    return daiElement;
  }
}
