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
import {getFcdaTitleValue, newFcdaSelectEvent} from "./foundation.js";
export let SVCLaterBindingList = class extends LitElement {
  constructor() {
    super();
    this.resetSelection = this.resetSelection.bind(this);
    parent.addEventListener("open-doc", this.resetSelection);
  }
  getSvcElements() {
    if (this.doc) {
      return Array.from(this.doc.querySelectorAll("LN0 > SampledValueControl")).sort((a, b) => compareNames(`${identity(a)}`, `${identity(b)}`));
    }
    return [];
  }
  getFcdaElements(svcElement) {
    const lnElement = svcElement.parentElement;
    if (lnElement) {
      return Array.from(lnElement.querySelectorAll(`:scope > DataSet[name=${svcElement.getAttribute("datSet")}] > FCDA`)).sort((a, b) => compareNames(`${identity(a)}`, `${identity(b)}`));
    }
    return [];
  }
  openEditWizard(svcElement) {
    const wizard = wizards["SampledValueControl"].edit(svcElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  resetSelection() {
    this.selectedSvcElement = void 0;
    this.selectedFcdaElement = void 0;
  }
  onFcdaSelect(svcElement, fcdaElement) {
    this.resetSelection();
    this.selectedSvcElement = svcElement;
    this.selectedFcdaElement = fcdaElement;
  }
  updated(_changedProperties) {
    super.updated(_changedProperties);
    if (_changedProperties.has("doc") || _changedProperties.has("selectedSvcElement") || _changedProperties.has("selectedFcdaElement")) {
      this.dispatchEvent(newFcdaSelectEvent(this.selectedSvcElement, this.selectedFcdaElement));
    }
  }
  renderFCDA(svcElement, fcdaElement) {
    return html`<mwc-list-item
      graphic="large"
      twoline
      class="subitem"
      @click=${() => this.onFcdaSelect(svcElement, fcdaElement)}
      value="${identity(svcElement)} ${identity(fcdaElement)}"
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
    const svcElements = this.getSvcElements();
    return html` <section tabindex="0">
      ${svcElements.length > 0 ? html`<h1>
              ${translate("subscription.smvLaterBinding.svcList.title")}
            </h1>
            <filtered-list>
              ${svcElements.map((svcElement) => {
      const fcdaElements = this.getFcdaElements(svcElement);
      return html`
                  <mwc-list-item
                    noninteractive
                    graphic="icon"
                    twoline
                    hasMeta
                    value="${identity(svcElement)} ${fcdaElements.map((fcdaElement) => identity(fcdaElement)).join(" ")}"
                  >
                    <mwc-icon-button
                      slot="meta"
                      icon="edit"
                      class="interactive"
                      @click=${() => this.openEditWizard(svcElement)}
                    ></mwc-icon-button>
                    <span
                      >${getNameAttribute(svcElement)}
                      ${getDescriptionAttribute(svcElement) ? html`${getDescriptionAttribute(svcElement)}` : nothing}</span
                    >
                    <span slot="secondary">${identity(svcElement)}</span>
                    <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
                  </mwc-list-item>
                  <li divider role="separator"></li>
                  ${fcdaElements.map((fcdaElement) => this.renderFCDA(svcElement, fcdaElement))}
                `;
    })}
            </filtered-list>` : html`<h1>
            ${translate("subscription.smvLaterBinding.svcList.noSvcFound")}
          </h1>`}
    </section>`;
  }
};
SVCLaterBindingList.styles = css`
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
], SVCLaterBindingList.prototype, "doc", 2);
__decorate([
  state()
], SVCLaterBindingList.prototype, "selectedSvcElement", 2);
__decorate([
  state()
], SVCLaterBindingList.prototype, "selectedFcdaElement", 2);
SVCLaterBindingList = __decorate([
  customElement("svc-later-binding-list")
], SVCLaterBindingList);
