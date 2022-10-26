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
} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import {
  getDescriptionAttribute,
  getNameAttribute,
  identity,
  newWizardEvent
} from "../../foundation.js";
import {gooseIcon, smvIcon} from "../../icons/icons.js";
import {wizards} from "../../wizards/wizard-library.js";
import {
  getFcdaSubtitleValue,
  getFcdaTitleValue,
  newFcdaSelectEvent,
  styles
} from "./foundation.js";
import {getSubscribedExtRefElements} from "./later-binding/foundation.js";
export let FcdaBindingList = class extends LitElement {
  constructor() {
    super();
    this.extRefCounters = new Map();
    this.iconControlLookup = {
      SampledValueControl: smvIcon,
      GSEControl: gooseIcon
    };
    this.resetSelection = this.resetSelection.bind(this);
    parent.addEventListener("open-doc", this.resetSelection);
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      this.resetExtRefCount = this.resetExtRefCount.bind(this);
      parentDiv.addEventListener("subscription-changed", this.resetExtRefCount);
    }
  }
  getControlElements() {
    if (this.doc) {
      return Array.from(this.doc.querySelectorAll(`LN0 > ${this.controlTag}`));
    }
    return [];
  }
  getFcdaElements(controlElement) {
    const lnElement = controlElement.parentElement;
    if (lnElement) {
      return Array.from(lnElement.querySelectorAll(`:scope > DataSet[name=${controlElement.getAttribute("datSet")}] > FCDA`));
    }
    return [];
  }
  resetExtRefCount(event) {
    if (event.detail.control && event.detail.fcda) {
      const controlBlockFcdaId = `${identity(event.detail.control)} ${identity(event.detail.fcda)}`;
      this.extRefCounters.delete(controlBlockFcdaId);
    }
  }
  getExtRefCount(fcdaElement, controlElement) {
    const controlBlockFcdaId = `${identity(controlElement)} ${identity(fcdaElement)}`;
    if (!this.extRefCounters.has(controlBlockFcdaId)) {
      const extRefCount = getSubscribedExtRefElements(this.doc.getRootNode(), this.controlTag, fcdaElement, controlElement, this.includeLaterBinding).length;
      this.extRefCounters.set(controlBlockFcdaId, extRefCount);
    }
    return this.extRefCounters.get(controlBlockFcdaId);
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
    if (_changedProperties.has("doc")) {
      this.extRefCounters = new Map();
    }
  }
  renderFCDA(controlElement, fcdaElement) {
    const fcdaCount = this.getExtRefCount(fcdaElement, controlElement);
    return html`<mwc-list-item
      graphic="large"
      ?hasMeta=${fcdaCount !== 0}
      twoline
      class="subitem"
      @click=${() => this.onFcdaSelect(controlElement, fcdaElement)}
      value="${identity(controlElement)}
             ${identity(fcdaElement)}"
    >
      <span>${getFcdaTitleValue(fcdaElement)}</span>
      <span slot="secondary">${getFcdaSubtitleValue(fcdaElement)}</span>
      <mwc-icon slot="graphic">subdirectory_arrow_right</mwc-icon>
      ${fcdaCount !== 0 ? html`<span slot="meta">${fcdaCount}</span>` : nothing}
    </mwc-list-item>`;
  }
  render() {
    const controlElements = this.getControlElements();
    return html` <section tabindex="0">
      ${controlElements.length > 0 ? html`<h1>
              ${translate(`subscription.${this.controlTag}.controlBlockList.title`)}
            </h1>
            <filtered-list activatable>
              ${controlElements.map((controlElement) => {
      const fcdaElements = this.getFcdaElements(controlElement);
      return html`
                  <mwc-list-item
                    noninteractive
                    graphic="icon"
                    twoline
                    hasMeta
                    value="
                        ${identity(controlElement)}${fcdaElements.map((fcdaElement) => `
                        ${getFcdaTitleValue(fcdaElement)}
                        ${getFcdaSubtitleValue(fcdaElement)}
                        ${identity(fcdaElement)}`).join("")}"
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
                    <mwc-icon slot="graphic"
                      >${this.iconControlLookup[this.controlTag]}</mwc-icon
                    >
                  </mwc-list-item>
                  <li divider role="separator"></li>
                  ${fcdaElements.map((fcdaElement) => this.renderFCDA(controlElement, fcdaElement))}
                `;
    })}
            </filtered-list>` : html`<h1>
            ${translate(`subscription.${this.controlTag}.controlBlockList.noControlBlockFound`)}
          </h1>`}
    </section>`;
  }
};
FcdaBindingList.styles = css`
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
], FcdaBindingList.prototype, "doc", 2);
__decorate([
  property()
], FcdaBindingList.prototype, "controlTag", 2);
__decorate([
  property()
], FcdaBindingList.prototype, "includeLaterBinding", 2);
__decorate([
  state()
], FcdaBindingList.prototype, "selectedControlElement", 2);
__decorate([
  state()
], FcdaBindingList.prototype, "selectedFcdaElement", 2);
__decorate([
  state()
], FcdaBindingList.prototype, "extRefCounters", 2);
FcdaBindingList = __decorate([
  customElement("fcda-binding-list")
], FcdaBindingList);
