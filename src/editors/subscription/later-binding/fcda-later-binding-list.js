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
  state
} from "../../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../../_snowpack/pkg/lit-html.js";
import {translate} from "../../../../_snowpack/pkg/lit-translate.js";
import "../../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import {
  compareNames,
  getDescriptionAttribute,
  getNameAttribute,
  identity,
  newWizardEvent
} from "../../../foundation.js";
import {smvIcon} from "../../../icons/icons.js";
import {wizards} from "../../../wizards/wizard-library.js";
import {styles} from "../foundation.js";
import {
  getFcdaTitleValue,
  newFcdaSelectEvent
} from "../smv-laterbinding/foundation.js";
export let FCDALaterBindingList = class extends LitElement {
  constructor() {
    super();
    this.resetSelection = this.resetSelection.bind(this);
    parent.addEventListener("open-doc", this.resetSelection);
  }
  getControlElements() {
    if (this.doc) {
      return Array.from(this.doc.querySelectorAll(`LN0 > ${this.controlTag}`)).sort((a, b) => compareNames(`${identity(a)}`, `${identity(b)}`));
    }
    return [];
  }
  getFcdaElements(controlElement) {
    const lnElement = controlElement.parentElement;
    if (lnElement) {
      return Array.from(lnElement.querySelectorAll(`:scope > DataSet[name=${controlElement.getAttribute("datSet")}] > FCDA`)).sort((a, b) => compareNames(`${identity(a)}`, `${identity(b)}`));
    }
    return [];
  }
  openEditWizard(controlElement) {
    const wizard = wizards[this.controlTag].edit(controlElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  resetSelection() {
    this.selectedControlElement = void 0;
    this.selectedFcdaElement = void 0;
  }
  onFcdaSelect(controlElement, fcdaElement) {
    this.resetSelection();
    this.selectedControlElement = controlElement;
    this.selectedFcdaElement = fcdaElement;
  }
  updated(_changedProperties) {
    super.updated(_changedProperties);
    if (_changedProperties.has("doc") || _changedProperties.has("selectedControlElement") || _changedProperties.has("selectedFcdaElement")) {
      this.dispatchEvent(newFcdaSelectEvent(this.selectedControlElement, this.selectedFcdaElement));
    }
  }
  renderFCDA(controlElement, fcdaElement) {
    return html`<mwc-list-item
      graphic="large"
      twoline
      class="subitem"
      @click=${() => this.onFcdaSelect(controlElement, fcdaElement)}
      value="${identity(controlElement)} ${identity(fcdaElement)}"
    >
      <span>${getFcdaTitleValue(fcdaElement)}</span>
      <span slot="secondary">
        ${fcdaElement.getAttribute("ldInst")}${fcdaElement.hasAttribute("ldInst") && fcdaElement.hasAttribute("prefix") ? html`/` : nothing}${fcdaElement.getAttribute("prefix")}
        ${fcdaElement.getAttribute("lnClass")}
        ${fcdaElement.getAttribute("lnInst")}
      </span>
      <mwc-icon slot="graphic">subdirectory_arrow_right</mwc-icon>
    </mwc-list-item>`;
  }
  render() {
    const controlElements = this.getControlElements();
    return html` <section tabindex="0">
      ${controlElements.length > 0 ? html`<h1>
              ${translate(`subscription.laterBinding.${this.controlTag}.controlBlockList.title`)}
            </h1>
            <filtered-list>
              ${controlElements.map((controlElement) => {
      const fcdaElements = this.getFcdaElements(controlElement);
      return html`
                  <mwc-list-item
                    noninteractive
                    graphic="icon"
                    twoline
                    hasMeta
                    value="${identity(controlElement)} ${fcdaElements.map((fcdaElement) => identity(fcdaElement)).join(" ")}"
                  >
                    <mwc-icon-button
                      slot="meta"
                      icon="edit"
                      class="interactive"
                      @click=${() => this.openEditWizard(controlElement)}
                    ></mwc-icon-button>
                    <span
                      >${getNameAttribute(controlElement)}
                      ${getDescriptionAttribute(controlElement) ? html`${getDescriptionAttribute(controlElement)}` : nothing}</span
                    >
                    <span slot="secondary">${identity(controlElement)}</span>
                    <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
                  </mwc-list-item>
                  <li divider role="separator"></li>
                  ${fcdaElements.map((fcdaElement) => this.renderFCDA(controlElement, fcdaElement))}
                `;
    })}
            </filtered-list>` : html`<h1>
            ${translate(`subscription.laterBinding.${this.controlTag}.controlBlockList.noControlBlockFound`)}
          </h1>`}
    </section>`;
  }
};
FCDALaterBindingList.styles = css`
    ${styles}

    mwc-list-item.hidden[noninteractive] + li[divider] {
      display: none;
    }

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    .interactive {
      pointer-events: all;
    }

    .subitem {
      padding-left: var(--mdc-list-side-padding, 16px);
    }
  `;
__decorate([
  property({attribute: false})
], FCDALaterBindingList.prototype, "doc", 2);
__decorate([
  property()
], FCDALaterBindingList.prototype, "controlTag", 2);
__decorate([
  state()
], FCDALaterBindingList.prototype, "selectedControlElement", 2);
__decorate([
  state()
], FCDALaterBindingList.prototype, "selectedFcdaElement", 2);
FCDALaterBindingList = __decorate([
  customElement("fcda-later-binding-list")
], FCDALaterBindingList);
