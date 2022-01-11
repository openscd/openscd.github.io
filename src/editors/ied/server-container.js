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
  css,
  customElement,
  html,
  LitElement,
  property
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-pane.js";
import "./ldevice-container.js";
export let ServerContainer = class extends LitElement {
  header() {
    return "Server";
  }
  render() {
    return html`<action-pane label="${this.header()}">
    ${Array.from(this.element.querySelectorAll(":scope > LDevice")).map((server) => html`<ldevice-container
        .element=${server}
      ></ldevice-container>`)}
    </action-pane>`;
  }
};
ServerContainer.styles = css``;
__decorate([
  property({attribute: false})
], ServerContainer.prototype, "element", 2);
ServerContainer = __decorate([
  customElement("server-container")
], ServerContainer);
