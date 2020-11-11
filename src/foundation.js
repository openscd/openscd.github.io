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
export function invert(action) {
  if (isCreate(action))
    return {old: action.new, derived: action.derived};
  else if (isDelete(action))
    return {new: action.old, derived: action.derived};
  else if (isMove(action))
    return {
      old: {
        parent: action.new.parent,
        element: action.old.element,
        reference: action.new.reference
      },
      new: {parent: action.old.parent, reference: action.old.reference},
      derived: action.derived
    };
  else if (isUpdate(action))
    return {new: action.old, old: action.new, derived: action.derived};
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
export const ifImplemented = directive((rendered) => (part) => {
  if (Object.keys(rendered).length)
    part.setValue(rendered);
  else
    part.setValue("");
});
export function unreachable(message) {
  throw new Error(message);
}
