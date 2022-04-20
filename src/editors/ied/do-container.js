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
  customElement,
  html,
  LitElement,
  property,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "../../action-pane.js";
import "./da-container.js";
import {getDescriptionAttribute, getNameAttribute, newWizardEvent} from "../../foundation.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import {createDoInfoWizard} from "./do-wizard.js";
import {findDOTypeElement} from "./foundation.js";
export let DOContainer = class extends LitElement {
  constructor() {
    super(...arguments);
    this.ancestors = [];
  }
  header() {
    const name = getNameAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    if (this.instanceElement != null) {
      return html`<b>${name}${desc ? html` &mdash; ${desc}` : nothing}</b>`;
    } else {
      return html`${name}${desc ? html` &mdash; ${desc}` : nothing}`;
    }
  }
  getDOElements() {
    const doType = findDOTypeElement(this.element);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(":scope > SDO"));
    }
    return [];
  }
  getDAElements() {
    const type = this.element.getAttribute("type") ?? void 0;
    const doType = this.element.closest("SCL").querySelector(`:root > DataTypeTemplates > DOType[id="${type}"]`);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(":scope > DA"));
    }
    return [];
  }
  getInstanceDOElement(dO) {
    const sdoName = getNameAttribute(dO);
    if (this.instanceElement) {
      return this.instanceElement.querySelector(`:scope > SDI[name="${sdoName}"]`);
    }
    return null;
  }
  getInstanceDAElement(da) {
    const daName = getNameAttribute(da);
    if (this.instanceElement) {
      return this.instanceElement.querySelector(`:scope > DAI[name="${daName}"]`);
    }
    return null;
  }
  render() {
    const daElements = this.getDAElements();
    const doElements = this.getDOElements();
    return html`<action-pane .label="${this.header()}" icon="${this.instanceElement != null ? "done" : ""}">
      <abbr slot="action">
        <mwc-icon-button
          title=${this.nsdoc.getDataDescription(this.element).label}
          icon="info"
          @click=${() => this.dispatchEvent(newWizardEvent(createDoInfoWizard(this.element, this.instanceElement, this.ancestors, this.nsdoc)))}
        ></mwc-icon-button>
      </abbr>
      ${daElements.length > 0 || doElements.length > 0 ? html`<abbr slot="action" title="${translate("iededitor.toggleChildElements")}">
          <mwc-icon-button-toggle
            id="toggleButton"
            onIcon="keyboard_arrow_up"
            offIcon="keyboard_arrow_down"
            @click=${() => this.requestUpdate()}
          ></mwc-icon-button-toggle>
        </abbr>` : nothing}
      ${this.toggleButton?.on ? daElements.map((da) => html`<da-container
          .element=${da}
          .instanceElement=${this.getInstanceDAElement(da)}
          .nsdoc=${this.nsdoc}
          .ancestors=${[this.element, ...this.ancestors]}
        ></da-container>`) : nothing}
      ${this.toggleButton?.on ? doElements.map((dO) => html`<do-container
          .element=${dO}
          .instanceElement=${this.getInstanceDOElement(dO)}
          .nsdoc=${this.nsdoc}
          .ancestors=${[this.element, ...this.ancestors]}
        ></do-container>`) : nothing}
    </action-pane>
    `;
  }
};
__decorate([
  property({attribute: false})
], DOContainer.prototype, "element", 2);
__decorate([
  property({attribute: false})
], DOContainer.prototype, "instanceElement", 2);
__decorate([
  property()
], DOContainer.prototype, "ancestors", 2);
__decorate([
  property()
], DOContainer.prototype, "nsdoc", 2);
__decorate([
  query("#toggleButton")
], DOContainer.prototype, "toggleButton", 2);
DOContainer = __decorate([
  customElement("do-container")
], DOContainer);
