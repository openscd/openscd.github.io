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
import {
  Container,
  getInstanceDAElement,
  getValueElement
} from "./foundation.js";
import {createDAIWizard} from "../../wizards/dai.js";
import {
  determineUninitializedStructure,
  initializeElements
} from "../../foundation/dai.js";
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
      return html`<b
        >${getValueElement(this.instanceElement)?.textContent?.trim() ?? ""}</b
      >`;
    }
    return html`${getValueElement(this.element)?.textContent?.trim() ?? ""}`;
  }
  getBDAElements() {
    const type = this.element.getAttribute("type") ?? void 0;
    const doType = this.element.closest("SCL").querySelector(`:root > DataTypeTemplates > DAType[id="${type}"]`);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(":scope > BDA"));
    }
    return [];
  }
  getTemplateStructure() {
    const doElement = this.ancestors.filter((element) => element.tagName == "DO")[0];
    const dataStructure = this.ancestors.slice(this.ancestors.indexOf(doElement));
    dataStructure.push(this.element);
    return dataStructure;
  }
  openCreateWizard() {
    const lnElement = this.ancestors.filter((element) => ["LN0", "LN"].includes(element.tagName))[0];
    const templateStructure = this.getTemplateStructure();
    const [parentElement, uninitializedTemplateStructure] = determineUninitializedStructure(lnElement, templateStructure);
    const newElement = initializeElements(uninitializedTemplateStructure);
    if (parentElement && newElement) {
      const wizard = createDAIWizard(parentElement, newElement, this.element);
      if (wizard)
        this.dispatchEvent(newWizardEvent(wizard));
    }
  }
  openEditWizard() {
    const wizard = wizards["DAI"].edit(this.element, this.instanceElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  render() {
    const bType = this.element.getAttribute("bType");
    return html`
      <action-pane
        .label="${this.header()}"
        icon="${this.instanceElement != null ? "done" : ""}"
      >
        <abbr slot="action">
          <mwc-icon-button
            title=${this.nsdoc.getDataDescription(this.element, this.ancestors).label}
            icon="info"
            @click=${() => this.dispatchEvent(newWizardEvent(createDaInfoWizard(this.element, this.instanceElement, this.ancestors, this.nsdoc)))}
          ></mwc-icon-button>
        </abbr>
        ${bType === "Struct" ? html` <abbr
              slot="action"
              title="${translate("iededitor.toggleChildElements")}"
            >
              <mwc-icon-button-toggle
                id="toggleButton"
                onIcon="keyboard_arrow_up"
                offIcon="keyboard_arrow_down"
                @click=${() => this.requestUpdate()}
              >
              </mwc-icon-button-toggle>
            </abbr>` : html` <div style="display: flex; flex-direction: row;">
              <div style="display: flex; align-items: center; flex: auto;">
                <h4>${this.getValue()}</h4>
              </div>
              <div style="display: flex; align-items: center;">
                ${this.instanceElement ? html`<mwc-icon-button
                      icon="edit"
                      .disabled="${!getCustomField()[bType]}"
                      @click=${() => this.openEditWizard()}
                    >
                    </mwc-icon-button>` : html`<mwc-icon-button
                      icon="add"
                      .disabled="${!getCustomField()[bType]}"
                      @click=${() => this.openCreateWizard()}
                    >
                    </mwc-icon-button>`}
              </div>
            </div>`}
        ${this.toggleButton?.on && bType === "Struct" ? this.getBDAElements().map((bdaElement) => html`<da-container
                  .doc=${this.doc}
                  .element=${bdaElement}
                  .instanceElement=${getInstanceDAElement(this.instanceElement, bdaElement)}
                  .nsdoc=${this.nsdoc}
                  .ancestors=${[...this.ancestors, this.element]}
                >
                </da-container>`) : nothing}
      </action-pane>
    `;
  }
};
DAContainer.styles = css`
    h4 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
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
  query("#toggleButton")
], DAContainer.prototype, "toggleButton", 2);
DAContainer = __decorate([
  customElement("da-container")
], DAContainer);
