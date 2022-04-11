import {
  cloneElement,
  createUpdateAction,
  getValue
} from "../../foundation.js";
import {get} from "../../../_snowpack/pkg/lit-translate.js";
import {updateReferences} from "./references.js";
export function updateNamingAction(element) {
  return (inputs) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    if (name === element.getAttribute("name") && desc === element.getAttribute("desc")) {
      return [];
    }
    const newElement = cloneElement(element, {name, desc});
    return [{old: {element}, new: {element: newElement}}];
  };
}
export function updateNamingAttributeWithReferencesAction(element, messageTitleKey) {
  return (inputs) => {
    const newAttributes = {};
    processNamingAttributes(newAttributes, element, inputs);
    if (Object.keys(newAttributes).length == 0) {
      return [];
    }
    addMissingAttributes(element, newAttributes);
    const name = getValue(inputs.find((i) => i.label === "name"));
    const complexAction = {
      actions: [],
      title: get(messageTitleKey, {name})
    };
    complexAction.actions.push(createUpdateAction(element, newAttributes));
    complexAction.actions.push(...updateReferences(element, element.getAttribute("name"), name));
    return complexAction.actions.length ? [complexAction] : [];
  };
}
export function processNamingAttributes(newAttributes, element, inputs) {
  const name = getValue(inputs.find((i) => i.label === "name"));
  const desc = getValue(inputs.find((i) => i.label === "desc"));
  if (name !== element.getAttribute("name")) {
    newAttributes["name"] = name;
  }
  if (desc !== element.getAttribute("desc")) {
    newAttributes["desc"] = desc;
  }
}
export function addMissingAttributes(element, newAttributes) {
  const newAttributeKeys = Object.keys(newAttributes);
  Array.from(element.attributes).filter((attr) => !newAttributeKeys.includes(attr.name)).forEach((attr) => {
    newAttributes[attr.name] = attr.value;
  });
  return newAttributes;
}
