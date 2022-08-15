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
import {
  compareNames,
  getDescriptionAttribute,
  getNameAttribute,
  identity
} from "../../../foundation.js";
import {styles} from "../foundation.js";
import {getFcdaTitleValue} from "./foundation.js";
export let ExtRefLaterBindingList = class extends LitElement {
  constructor() {
    super();
    this.onFcdaSelectEvent = this.onFcdaSelectEvent.bind(this);
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      parentDiv.addEventListener("fcda-select", this.onFcdaSelectEvent);
    }
  }
  getExtRefElements() {
    if (this.doc) {
      return Array.from(this.doc.querySelectorAll("ExtRef")).filter((element) => element.hasAttribute("intAddr")).filter((element) => element.closest("IED") !== this.currentIedElement).sort((a, b) => compareNames(`${a.getAttribute("intAddr")}`, `${b.getAttribute("intAddr")}`));
    }
    return [];
  }
  getSubscribedExtRefElements() {
    return this.getExtRefElements().filter((element) => this.isSubscribedTo(element));
  }
  getAvailableExtRefElements() {
    return this.getExtRefElements().filter((element) => !this.isSubscribed(element));
  }
  async onFcdaSelectEvent(event) {
    this.currentSelectedSvcElement = event.detail.svc;
    this.currentSelectedFcdaElement = event.detail.fcda;
    this.currentIedElement = this.currentSelectedFcdaElement ? this.currentSelectedFcdaElement.closest("IED") ?? void 0 : void 0;
  }
  sameAttributeValue(extRefElement, attributeName) {
    return extRefElement.getAttribute(attributeName) === this.currentSelectedFcdaElement?.getAttribute(attributeName);
  }
  isSubscribedTo(extRefElement) {
    return extRefElement.getAttribute("iedName") === this.currentIedElement?.getAttribute("name") && this.sameAttributeValue(extRefElement, "ldInst") && this.sameAttributeValue(extRefElement, "prefix") && this.sameAttributeValue(extRefElement, "lnClass") && this.sameAttributeValue(extRefElement, "lnInst") && this.sameAttributeValue(extRefElement, "doName") && this.sameAttributeValue(extRefElement, "daName");
  }
  isSubscribed(extRefElement) {
    return extRefElement.hasAttribute("iedName") && extRefElement.hasAttribute("ldInst") && extRefElement.hasAttribute("prefix") && extRefElement.hasAttribute("lnClass") && extRefElement.hasAttribute("lnInst") && extRefElement.hasAttribute("doName") && extRefElement.hasAttribute("daName");
  }
  unsupportedExtRefElement(extRefElement) {
    return extRefElement.hasAttribute("pLN") || extRefElement.hasAttribute("pDO") || extRefElement.hasAttribute("pDA") || extRefElement.hasAttribute("pServT");
  }
  renderTitle() {
    const svcName = this.currentSelectedSvcElement ? getNameAttribute(this.currentSelectedSvcElement) : void 0;
    const fcdaName = this.currentSelectedFcdaElement ? getFcdaTitleValue(this.currentSelectedFcdaElement) : void 0;
    return html`<h1>
      ${translate("subscription.smvLaterBinding.extRefList.title", {
      svcName: svcName ?? "-",
      fcdaName: fcdaName ?? "-"
    })}
    </h1>`;
  }
  renderSubscribedExtRefs() {
    const subscribedExtRefs = this.getSubscribedExtRefElements();
    return html`
      <mwc-list-item
        noninteractive
        value="${subscribedExtRefs.map((extRefElement) => getDescriptionAttribute(extRefElement) + " " + identity(extRefElement)).join(" ")}"
      >
        <span>${translate("subscription.subscriber.subscribed")}</span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${subscribedExtRefs.length > 0 ? html`${subscribedExtRefs.map((extRefElement) => html` <mwc-list-item
              graphic="large"
              twoline
              value="${identity(extRefElement)}"
            >
              <span>
                ${extRefElement.getAttribute("intAddr")}
                ${getDescriptionAttribute(extRefElement) ? html` (${getDescriptionAttribute(extRefElement)})` : nothing}
              </span>
              <span slot="secondary">${identity(extRefElement)}</span>
              <mwc-icon slot="graphic">swap_horiz</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.smvLaterBinding.extRefList.noSubscribedExtRefs")}
          </mwc-list-item>`}
    `;
  }
  renderAvailableExtRefs() {
    const availableExtRefs = this.getAvailableExtRefElements();
    return html`
      <mwc-list-item
        noninteractive
        value="${availableExtRefs.map((extRefElement) => getDescriptionAttribute(extRefElement) + " " + identity(extRefElement)).join(" ")}"
      >
        <span>
          ${translate("subscription.subscriber.availableToSubscribe")}
        </span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${availableExtRefs.length > 0 ? html`${availableExtRefs.map((extRefElement) => html` <mwc-list-item
              graphic="large"
              ?disabled=${this.unsupportedExtRefElement(extRefElement)}
              twoline
              value="${identity(extRefElement)}"
            >
              <span>
                ${extRefElement.getAttribute("intAddr")}
                ${getDescriptionAttribute(extRefElement) ? html` (${getDescriptionAttribute(extRefElement)})` : nothing}
              </span>
              <span slot="secondary">${identity(extRefElement)}</span>
              <mwc-icon slot="graphic">arrow_back</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.smvLaterBinding.extRefList.noAvailableExtRefs")}
          </mwc-list-item>`}
    `;
  }
  render() {
    return html` <section tabindex="0">
      ${this.currentSelectedSvcElement && this.currentSelectedFcdaElement ? html`
            ${this.renderTitle()}
            <filtered-list>
              ${this.renderSubscribedExtRefs()} ${this.renderAvailableExtRefs()}
            </filtered-list>
          ` : html`
            <h1>
              ${translate("subscription.smvLaterBinding.extRefList.noSelection")}
            </h1>
          `}
    </section>`;
  }
};
ExtRefLaterBindingList.styles = css`
    ${styles}

    mwc-list-item.hidden[noninteractive] + li[divider] {
      display: none;
    }
  `;
__decorate([
  property({attribute: false})
], ExtRefLaterBindingList.prototype, "doc", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentSelectedSvcElement", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentSelectedFcdaElement", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentIedElement", 2);
ExtRefLaterBindingList = __decorate([
  customElement("extref-later-binding-list")
], ExtRefLaterBindingList);
