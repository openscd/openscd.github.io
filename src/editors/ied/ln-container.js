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
  property,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import "../../action-pane.js";
import "./do-container.js";
import {getInstanceAttribute, getNameAttribute} from "../../foundation.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import {until} from "../../../_snowpack/pkg/lit-html/directives/until.js";
export let LNContainer = class extends LitElement {
  constructor() {
    super(...arguments);
    this.ancestors = [];
  }
  async header() {
    const prefix = this.element.getAttribute("prefix");
    const inst = getInstanceAttribute(this.element);
    const data = this.nsdoc.getDataDescription(this.element);
    return html`${prefix != null ? html`${prefix} &mdash; ` : nothing}
            ${data.label}
            ${inst ? html` &mdash; ${inst}` : nothing}`;
  }
  getDOElements() {
    const lnType = this.element.getAttribute("lnType") ?? void 0;
    const lNodeType = this.element.closest("SCL").querySelector(`:root > DataTypeTemplates > LNodeType[id="${lnType}"]`);
    if (lNodeType != null) {
      return Array.from(lNodeType.querySelectorAll(":scope > DO"));
    }
    return [];
  }
  getInstanceElement(dO) {
    const doName = getNameAttribute(dO);
    return this.element.querySelector(`:scope > DOI[name="${doName}"]`);
  }
  render() {
    const doElements = this.getDOElements();
    return html`<action-pane .label="${until(this.header())}">
      ${doElements.length > 0 ? html`<abbr slot="action" title="${translate("iededitor.toggleChildElements")}">
        <mwc-icon-button-toggle
          id="toggleButton"
          onIcon="keyboard_arrow_up"
          offIcon="keyboard_arrow_down"
          @click=${() => this.requestUpdate()}
        ></mwc-icon-button-toggle>
      </abbr>` : nothing}
      ${this.toggleButton?.on ? this.getDOElements().map((dO) => html`<do-container
          .element=${dO}
          .instanceElement=${this.getInstanceElement(dO)}
          .nsdoc=${this.nsdoc}
          .ancestors=${[this.element, ...this.ancestors]}
        ></do-container>
        `) : nothing}
    </action-pane>`;
  }
};
LNContainer.styles = css``;
__decorate([
  property({attribute: false})
], LNContainer.prototype, "element", 2);
__decorate([
  property()
], LNContainer.prototype, "ancestors", 2);
__decorate([
  property()
], LNContainer.prototype, "nsdoc", 2);
__decorate([
  query("#toggleButton")
], LNContainer.prototype, "toggleButton", 2);
LNContainer = __decorate([
  customElement("ln-container")
], LNContainer);
