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
  property,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "../../action-pane.js";
import {getNameAttribute, newWizardEvent} from "../../foundation.js";
import {wizards} from "../../wizards/wizard-library.js";
import {getCustomField} from "./foundation/foundation.js";
import {createDaInfoWizard} from "./da-wizard.js";
import {Container, getInstanceDAElement, getValueElement} from "./foundation.js";
export let DAContainer = class extends Container {
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
  getValue() {
    if (this.instanceElement) {
      return getValueElement(this.instanceElement)?.textContent?.trim();
    }
    return getValueElement(this.element)?.textContent?.trim();
  }
  getBDAElements() {
    const type = this.element.getAttribute("type") ?? void 0;
    const doType = this.element.closest("SCL").querySelector(`:root > DataTypeTemplates > DAType[id="${type}"]`);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(":scope > BDA"));
    }
    return [];
  }
  openEditWizard() {
    const wizard = wizards["DAI"].edit(this.element, this.instanceElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
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
        </abbr>` : this.instanceElement && getCustomField()[bType] ? html`<div style="display: flex; flex-direction: row;">
            <div style="display: flex; align-items: center; flex: auto;">
              <h6>${this.getValue() ?? ""}</h6>
            </div>
            <div style="display: flex; align-items: center;">
              <mwc-icon-button
                icon="edit"
                @click=${() => this.openEditWizard()}
              ></mwc-icon-button>
            </div>
          </div>` : html`<h6>${this.getValue() ?? ""}</h6>`}
      ${this.toggleButton?.on && bType == "Struct" ? this.getBDAElements().map((bdaElement) => html`<da-container
          .element=${bdaElement}
          .instanceElement=${getInstanceDAElement(this.instanceElement, bdaElement)}
          .nsdoc=${this.nsdoc}
          .ancestors=${[...this.ancestors, this.element]}
        ></da-container>`) : nothing}
    </action-pane>
    `;
  }
};
DAContainer.styles = css`
    h6 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      padding-left: 0.3em;
    }

    mwc-icon-button {
      color: var(--mdc-theme-on-surface);
    }
  `;
__decorate([
  property({attribute: false})
], DAContainer.prototype, "instanceElement", 2);
__decorate([
  property()
], DAContainer.prototype, "nsdoc", 2);
__decorate([
  query("#toggleButton")
], DAContainer.prototype, "toggleButton", 2);
DAContainer = __decorate([
  customElement("da-container")
], DAContainer);
