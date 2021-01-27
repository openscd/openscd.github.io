import {directive} from "../web_modules/lit-html.js";
import {WizardTextField} from "./wizard-textfield.js";
export function isCreate(action) {
  return action.old === void 0 && action.new?.parent !== void 0 && action.new?.element !== void 0 && action.new?.reference !== void 0;
}
export function isDelete(action) {
  return action.old?.parent !== void 0 && action.old?.element !== void 0 && action.old?.reference !== void 0 && action.new === void 0;
}
export function isMove(action) {
  return action.old?.parent !== void 0 && action.old?.element !== void 0 && action.old?.reference !== void 0 && action.new?.parent !== void 0 && action.new?.element == void 0 && action.new?.reference !== void 0;
}
export function isUpdate(action) {
  return action.old?.parent === void 0 && action.old?.element !== void 0 && action.new?.parent === void 0 && action.new?.element !== void 0;
}
export function isSimple(action) {
  return !(action.actions instanceof Array);
}
export function invert(action) {
  if (!isSimple(action)) {
    const inverse = {
      title: action.title,
      derived: action.derived,
      actions: []
    };
    action.actions.forEach((element) => inverse.actions.unshift(invert(element)));
    return inverse;
  }
  const metaData = {
    derived: action.derived,
    checkValidity: action.checkValidity
  };
  if (isCreate(action))
    return {old: action.new, ...metaData};
  else if (isDelete(action))
    return {new: action.old, ...metaData};
  else if (isMove(action))
    return {
      old: {
        parent: action.new.parent,
        element: action.old.element,
        reference: action.new.reference
      },
      new: {parent: action.old.parent, reference: action.old.reference},
      ...metaData
    };
  else if (isUpdate(action))
    return {new: action.old, old: action.new, ...metaData};
  else
    return unreachable("Unknown EditorAction type in invert.");
}
export function newActionEvent(action, eventInitDict) {
  return new CustomEvent("editor-action", {
    bubbles: true,
    composed: true,
    detail: {action},
    ...eventInitDict
  });
}
export const wizardInputSelector = "wizard-textfield, mwc-select";
export function getValue(input) {
  if (input instanceof WizardTextField)
    return input.maybeValue;
  else
    return input.value;
}
export function getMultiplier(input) {
  if (input instanceof WizardTextField)
    return input.multiplier;
  else
    return null;
}
export function newWizardEvent(wizard = null, eventInitDict) {
  return new CustomEvent("wizard", {
    bubbles: true,
    composed: true,
    detail: {wizard},
    ...eventInitDict
  });
}
export function newLogEvent(detail, eventInitDict) {
  return new CustomEvent("log", {
    bubbles: true,
    composed: true,
    detail,
    ...eventInitDict
  });
}
export function newPendingStateEvent(promise, eventInitDict) {
  return new CustomEvent("pending-state", {
    bubbles: true,
    composed: true,
    detail: {promise},
    ...eventInitDict
  });
}
export function referencePath(element) {
  let path = "";
  let nextParent = element.parentElement;
  while (nextParent?.getAttribute("name")) {
    path = "/" + nextParent.getAttribute("name") + path;
    nextParent = nextParent.parentElement;
  }
  return path;
}
export function createElement(doc, tag, attrs) {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs).filter(([_, value]) => value !== null).forEach(([name2, value]) => element.setAttribute(name2, value));
  return element;
}
export const ifImplemented = directive((rendered) => (part) => {
  if (Object.keys(rendered).length)
    part.setValue(rendered);
  else
    part.setValue("");
});
const nameStartChar = "[:_A-Za-z]|[\xC0-\xD6]|[\xD8-\xF6]|[\xF8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u{10000}\\-\u{EFFFF}]";
const nameChar = nameStartChar + "|[.0-9-]|\xB7|[\u0300-\u036F]|[\u203F-\u2040]";
const name = nameStartChar + "(" + nameChar + ")*";
const nmToken = "(" + nameChar + ")+";
export const restrictions = {
  string: "([	-\n]|[\r]|[ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  normalizedString: "([ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  name,
  nmToken,
  names: name + "( " + name + ")*",
  nmTokens: nmToken + "( " + nmToken + ")*",
  decimal: "((-|\\+)?([0-9]+(\\.[0-9]*)?|\\.[0-9]+))",
  unsigned: "\\+?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)"
};
export function compareNames(a, b) {
  return a.getAttribute("name").localeCompare(b.getAttribute("name"));
}
export function unreachable(message) {
  throw new Error(message);
}
export function crossProduct(...arrays) {
  return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())), [[]]);
}
