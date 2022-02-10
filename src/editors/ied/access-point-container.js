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
import "./server-container.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {getDescriptionAttribute, getNameAttribute} from "../../foundation.js";
export let AccessPointContainer = class extends LitElement {
  constructor() {
    super(...arguments);
    this.ancestors = [];
  }
  header() {
    const name = getNameAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    return html`${name}${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  render() {
    return html`<action-pane .label="${this.header()}">
    ${Array.from(this.element.querySelectorAll(":scope > Server")).map((server) => html`<server-container
        .element=${server}
        .nsdoc=${this.nsdoc}
        .ancestors=${[this.element, ...this.ancestors]}
      ></server-container>`)}
    </action-pane>`;
  }
};
AccessPointContainer.styles = css``;
__decorate([
  property({attribute: false})
], AccessPointContainer.prototype, "element", 2);
__decorate([
  property()
], AccessPointContainer.prototype, "ancestors", 2);
__decorate([
  property()
], AccessPointContainer.prototype, "nsdoc", 2);
AccessPointContainer = __decorate([
  customElement("access-point-container")
], AccessPointContainer);
