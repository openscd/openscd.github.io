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
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "../../action-pane.js";
import {getNameAttribute, newWizardEvent} from "../../foundation.js";
import {createDaInfoWizard} from "./da-wizard.js";
import {getValueElement} from "./foundation.js";
export let DAContainer = class extends LitElement {
  constructor() {
    super(...arguments);
    this.ancestors = [];
  }
  header() {
    const name = getNameAttribute(this.element);
    const bType = this.element.getAttribute("bType") ?? nothing;
    const fc = this.element.getAttribute("fc");
    if (this.instanceElement) {
      return html`<b>${name}</b> &mdash; ${bType}${fc ? html` [${fc}]` : ``}`;
    } else {
      return html`${name} &mdash; ${bType}${fc ? html` [${fc}]` : ``}`;
    }
  }
  renderValue() {
    if (this.instanceElement) {
      return html`${getValueElement(this.instanceElement)?.textContent}`;
    }
    return html`${getValueElement(this.element)?.textContent}`;
  }
  getBDAElements() {
    const type = this.element.getAttribute("type") ?? void 0;
    const doType = this.element.closest("SCL").querySelector(`:root > DataTypeTemplates > DAType[id="${type}"]`);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(":scope > BDA"));
    }
    return [];
  }
  render() {
    const bType = this.element.getAttribute("bType");
    return html`<action-pane .label="${this.header()}" icon="${this.instanceElement != null ? "done" : ""}">
      <abbr slot="action">
        <mwc-icon-button
          title=${this.nsdoc.getDataDescription(this.element, this.ancestors).label}
          icon="info"
          @click=${() => this.dispatchEvent(newWizardEvent(createDaInfoWizard(this.element, this.instanceElement, this.ancestors, this.nsdoc)))}
        ></mwc-icon-button>
      </abbr>
      ${bType == "Struct" ? html`<abbr slot="action" title="${translate("iededitor.toggleChildElements")}">
        <mwc-icon-button-toggle
          id="toggleButton"
          onIcon="keyboard_arrow_up"
          offIcon="keyboard_arrow_down"
          @click=${() => this.requestUpdate()}
        ></mwc-icon-button-toggle>
      </abbr>` : nothing}
      <h6>${this.renderValue()}</h6>
      ${this.toggleButton?.on && bType == "Struct" ? this.getBDAElements().map((element) => html`<da-container
          .element=${element}
          .nsdoc=${this.nsdoc}
          .ancestors=${[this.element, ...this.ancestors]}
        ></da-container>`) : nothing}
    </action-pane>
    `;
  }
};
DAContainer.styles = css`
    h6 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
      font-size: 0.8em;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      padding-left: 0.3em;
    }
  `;
__decorate([
  property({attribute: false})
], DAContainer.prototype, "element", 2);
__decorate([
  property({attribute: false})
], DAContainer.prototype, "instanceElement", 2);
__decorate([
  property()
], DAContainer.prototype, "ancestors", 2);
__decorate([
  property()
], DAContainer.prototype, "nsdoc", 2);
__decorate([
  query("#toggleButton")
], DAContainer.prototype, "toggleButton", 2);
DAContainer = __decorate([
  customElement("da-container")
], DAContainer);
