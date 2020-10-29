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
import {LitElement, customElement} from "../../web_modules/lit-element.js";
import {Editing as Editing2} from "../../src/Editing.js";
export let MockEditor = class extends Editing2(LitElement) {
};
MockEditor = __decorate([
  customElement("mock-editor")
], MockEditor);
