import {isPublic} from "../../foundation.js";
const referenceInfoTags = ["IED"];
const referenceInfos = {
  IED: [{
    elementQuery: `Association`,
    attribute: "iedName"
  }, {
    elementQuery: `ClientLN`,
    attribute: "iedName"
  }, {
    elementQuery: `ConnectedAP`,
    attribute: "iedName"
  }, {
    elementQuery: `ExtRef`,
    attribute: "iedName"
  }, {
    elementQuery: `KDC`,
    attribute: "iedName"
  }, {
    elementQuery: `LNode`,
    attribute: "iedName"
  }, {
    elementQuery: `GSEControl > IEDName`,
    attribute: null
  }, {
    elementQuery: `SampledValueControl > IEDName`,
    attribute: null
  }]
};
function cloneElement(element, attributeName, value) {
  const newElement = element.cloneNode(false);
  if (value === null) {
    newElement.removeAttribute(attributeName);
  } else {
    newElement.setAttribute(attributeName, value);
  }
  return newElement;
}
function cloneElementAndTextContent(element, value) {
  const newElement = element.cloneNode(false);
  newElement.textContent = value;
  return newElement;
}
export function updateReferences(element, oldValue, newValue) {
  if (oldValue === newValue) {
    return [];
  }
  const referenceInfo = referenceInfos[element.tagName];
  if (referenceInfo === void 0) {
    return [];
  }
  const actions = [];
  referenceInfo.forEach((info) => {
    if (info.attribute !== null) {
      Array.from(element.ownerDocument.querySelectorAll(`${info.elementQuery}[${info.attribute}="${oldValue}"]`)).filter(isPublic).forEach((element2) => {
        const newElement = cloneElement(element2, info.attribute, newValue);
        actions.push({old: {element: element2}, new: {element: newElement}});
      });
    } else {
      Array.from(element.ownerDocument.querySelectorAll(`${info.elementQuery}`)).filter((element2) => element2.textContent === oldValue).filter(isPublic).forEach((element2) => {
        const newElement = cloneElementAndTextContent(element2, newValue);
        actions.push({old: {element: element2}, new: {element: newElement}});
      });
    }
  });
  return actions;
}
