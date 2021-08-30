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
import {LitElement, customElement} from "../../_snowpack/pkg/lit-element.js";
import {Plugging} from "../../src/Plugging.js";
import {Editing} from "../../src/Editing.js";
export let MockPlugger = class extends Plugging(Editing(LitElement)) {
};
MockPlugger = __decorate([
  customElement("mock-plugger")
], MockPlugger);
