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
import {LitElement, customElement} from "../_snowpack/pkg/lit-element.js";
import {Wizarding} from "../src/Wizarding.js";
export let MockWizard = class extends Wizarding(LitElement) {
};
MockWizard = __decorate([
  customElement("mock-wizard")
], MockWizard);
