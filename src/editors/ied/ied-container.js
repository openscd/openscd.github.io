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
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import "../../action-pane.js";
import {getDescriptionAttribute, getNameAttribute} from "../../foundation.js";
import "./access-point-container.js";
export let IedContainer = class extends LitElement {
  header() {
    const name = getNameAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    return html`${name}${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  render() {
    return html`<action-pane .label="${this.header()}">
      ${Array.from(this.element.querySelectorAll(":scope > AccessPoint")).map((ap) => html`<access-point-container
          .element=${ap}
        ></access-point-container>`)}
      </action-pane>`;
  }
};
IedContainer.styles = css``;
__decorate([
  property({attribute: false})
], IedContainer.prototype, "element", 2);
IedContainer = __decorate([
  customElement("ied-container")
], IedContainer);
