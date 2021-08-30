var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {Wizarding} from "../src/Wizarding.js";
import {Editing} from "../src/Editing.js";
import {LitElement, customElement} from "../_snowpack/pkg/lit-element.js";
export let MockWizardEditor = class extends Wizarding(Editing(LitElement)) {
};
MockWizardEditor = __decorate([
  customElement("mock-wizard-editor")
], MockWizardEditor);
