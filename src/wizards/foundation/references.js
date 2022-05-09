import {
  isPublic
} from "../../foundation.js";
const referenceInfoTags = ["IED", "Substation", "VoltageLevel", "Bay"];
const referenceInfos = {
  IED: [{
    attributeName: "iedName",
    filter: simpleAttributeFilter(`Association`)
  }, {
    attributeName: "iedName",
    filter: simpleAttributeFilter(`ClientLN`)
  }, {
    attributeName: "iedName",
    filter: simpleAttributeFilter(`ConnectedAP`)
  }, {
    attributeName: "iedName",
    filter: simpleAttributeFilter(`ExtRef`)
  }, {
    attributeName: "iedName",
    filter: simpleAttributeFilter(`KDC`)
  }, {
    attributeName: "iedName",
    filter: simpleAttributeFilter(`LNode`)
  }, {
    attributeName: null,
    filter: simpleTextContentFilter(`GSEControl > IEDName`)
  }, {
    attributeName: null,
    filter: simpleTextContentFilter(`SampledValueControl > IEDName`)
  }],
  Substation: [{
    attributeName: "substationName",
    filter: simpleAttributeFilter(`Terminal`)
  }],
  VoltageLevel: [{
    attributeName: "voltageLevelName",
    filter: attributeFilterWithParentNameAttribute(`Terminal`, {Substation: "substationName"})
  }],
  Bay: [{
    attributeName: "bayName",
    filter: attributeFilterWithParentNameAttribute(`Terminal`, {Substation: "substationName", VoltageLevel: "voltageLevelName"})
  }]
};
function simpleAttributeFilter(tagName) {
  return function filter(element, attributeName, oldName) {
    return `${tagName}[${attributeName}="${oldName}"]`;
  };
}
function simpleTextContentFilter(elementQuery) {
  return function filter() {
    return `${elementQuery}`;
  };
}
function attributeFilterWithParentNameAttribute(tagName, parentInfo) {
  return function filter(element, attributeName, oldName) {
    return `${tagName}${Object.entries(parentInfo).map(([parentTag, parentAttribute]) => {
      const parentElement = element.closest(parentTag);
      if (parentElement && parentElement.hasAttribute("name")) {
        const name = parentElement.getAttribute("name");
        return `[${parentAttribute}="${name}"]`;
      }
      return null;
    }).join("")}[${attributeName}="${oldName}"]`;
  };
}
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
export function updateReferences(element, oldName, newName) {
  if (oldName === newName) {
    return [];
  }
  const referenceInfo = referenceInfos[element.tagName];
  if (referenceInfo === void 0) {
    return [];
  }
  const actions = [];
  referenceInfo.forEach((info) => {
    if (info.attributeName) {
      const filter = info.filter(element, info.attributeName, oldName);
      Array.from(element.ownerDocument.querySelectorAll(`${filter}`)).filter(isPublic).forEach((element2) => {
        const newElement = cloneElement(element2, info.attributeName, newName);
        actions.push({old: {element: element2}, new: {element: newElement}});
      });
    } else {
      const filter = info.filter(element, info.attributeName, oldName);
      Array.from(element.ownerDocument.querySelectorAll(`${filter}`)).filter((element2) => element2.textContent === oldName).filter(isPublic).forEach((element2) => {
        const newElement = cloneElementAndTextContent(element2, newName);
        actions.push({old: {element: element2}, new: {element: newElement}});
      });
    }
  });
  return actions;
}
