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
import {
  LitElement,
  html,
  customElement,
  property,
  state
} from "../../../_snowpack/pkg/lit-element.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../action-icon.js";
import {sizableGooseIcon} from "../../icons/icons.js";
export let GseEditor = class extends LitElement {
  get label() {
    return this.element.getAttribute("ldInst") + "/" + this.element.getAttribute("cbName");
  }
  render() {
    return html`<action-icon label="${this.label}"
      ><mwc-icon slot="icon">${sizableGooseIcon}</mwc-icon></action-icon
    >`;
  }
};
__decorate([
  property({attribute: false})
], GseEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], GseEditor.prototype, "element", 2);
__decorate([
  state()
], GseEditor.prototype, "label", 1);
GseEditor = __decorate([
  customElement("gse-editor")
], GseEditor);
