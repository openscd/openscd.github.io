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
import {translate} from "../../../../_snowpack/pkg/lit-translate.js";
import {identity} from "../../../foundation.js";
import {serviceTypes, styles} from "../foundation.js";
import {isSubscribedTo} from "./foundation.js";
export let ExtRefLnBindingList = class extends LitElement {
  constructor() {
    super();
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      this.onFcdaSelectEvent = this.onFcdaSelectEvent.bind(this);
      parentDiv.addEventListener("fcda-select", this.onFcdaSelectEvent);
    }
  }
  getLNElements() {
    if (this.doc) {
      return Array.from(this.doc.querySelectorAll("LDevice > LN0, LDevice > LN")).filter((element) => element.closest("IED") !== this.currentIedElement).sort((a, b) => (identity(a.closest("LDevice")) + " " + this.buildLNTitle(a)).localeCompare(identity(b.closest("LDevice")) + " " + this.buildLNTitle(b)));
    }
    return [];
  }
  getSubscribedLNElements() {
    return this.getLNElements().filter((element) => Array.from(element.querySelectorAll("ExtRef")).filter((extRefElement) => extRefElement.getAttribute("intAddr") === null).some((extRefElement) => isSubscribedTo(serviceTypes[this.controlTag], this.currentIedElement, this.currentSelectedControlElement, this.currentSelectedFcdaElement, extRefElement)));
  }
  getAvailableLNElements() {
    return this.getLNElements().filter((element) => !Array.from(element.querySelectorAll("ExtRef")).some((extRefElement) => isSubscribedTo(serviceTypes[this.controlTag], this.currentIedElement, this.currentSelectedControlElement, this.currentSelectedFcdaElement, extRefElement)));
  }
  async onFcdaSelectEvent(event) {
    this.currentSelectedControlElement = event.detail.controlElement;
    this.currentSelectedFcdaElement = event.detail.fcda;
    this.currentIedElement = this.currentSelectedFcdaElement ? this.currentSelectedFcdaElement.closest("IED") ?? void 0 : void 0;
  }
  bindingNotSupported(lnElement) {
    const iedElement = lnElement.closest("IED");
    return (iedElement.querySelector(":scope > AccessPoint > Services > ClientServices, :scope > Services > ClientServices")?.getAttribute("noIctBinding") ?? "false") === "true";
  }
  buildLNTitle(lnElement) {
    const prefix = lnElement.getAttribute("prefix");
    const inst = lnElement.getAttribute("inst");
    const data = this.nsdoc.getDataDescription(lnElement);
    return `${prefix ? `${prefix} - ` : ""}${data.label} ${inst ? ` - ${inst}` : ""}`;
  }
  renderTitle() {
    return html`<h1>${translate(`subscription.binding.extRefList.title`)}</h1>`;
  }
  renderSubscribedLNs() {
    const subscribedLNs = this.getSubscribedLNElements();
    return html`
      <mwc-list-item
        noninteractive
        value="${subscribedLNs.map((lnElement) => this.buildLNTitle(lnElement) + " " + identity(lnElement.closest("LDevice"))).join(" ")}"
      >
        <span>${translate("subscription.subscriber.subscribed")}</span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${subscribedLNs.length > 0 ? html`${subscribedLNs.map((lnElement) => html` <mwc-list-item
              graphic="large"
              ?disabled=${this.bindingNotSupported(lnElement)}
              twoline
              value="${identity(lnElement)}"
            >
              <span>${this.buildLNTitle(lnElement)}</span>
              <span slot="secondary">
                ${identity(lnElement.closest("LDevice"))}
              </span>
              <mwc-icon slot="graphic">close</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.binding.extRefList.noSubscribedLNs")}
          </mwc-list-item>`}
    `;
  }
  renderAvailableLNs() {
    const availableLNs = this.getAvailableLNElements();
    return html`
      <mwc-list-item
        noninteractive
        value="${availableLNs.map((lnElement) => this.buildLNTitle(lnElement) + " " + identity(lnElement.closest("LDevice"))).join(" ")}"
      >
        <span>
          ${translate("subscription.subscriber.availableToSubscribe")}
        </span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${availableLNs.length > 0 ? html`${availableLNs.map((lnElement) => html` <mwc-list-item
              graphic="large"
              ?disabled=${this.bindingNotSupported(lnElement)}
              twoline
              value="${identity(lnElement)}"
            >
              <span>${this.buildLNTitle(lnElement)}</span>
              <span slot="secondary">
                ${identity(lnElement.closest("LDevice"))}
              </span>
              <mwc-icon slot="graphic">add</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.binding.extRefList.noAvailableLNs")}
          </mwc-list-item>`}
    `;
  }
  render() {
    return html` <section tabindex="0">
      ${this.currentSelectedControlElement && this.currentSelectedFcdaElement ? html`
            ${this.renderTitle()}
            <filtered-list>
              ${this.renderSubscribedLNs()} ${this.renderAvailableLNs()}
            </filtered-list>
          ` : html`
            <h1>${translate("subscription.binding.extRefList.noSelection")}</h1>
          `}
    </section>`;
  }
};
ExtRefLnBindingList.styles = css`
    ${styles}

    mwc-list-item.hidden[noninteractive] + li[divider] {
      display: none;
    }
  `;
__decorate([
  property({attribute: false})
], ExtRefLnBindingList.prototype, "doc", 2);
__decorate([
  property()
], ExtRefLnBindingList.prototype, "nsdoc", 2);
__decorate([
  property()
], ExtRefLnBindingList.prototype, "controlTag", 2);
__decorate([
  state()
], ExtRefLnBindingList.prototype, "currentSelectedControlElement", 2);
__decorate([
  state()
], ExtRefLnBindingList.prototype, "currentSelectedFcdaElement", 2);
__decorate([
  state()
], ExtRefLnBindingList.prototype, "currentIedElement", 2);
ExtRefLnBindingList = __decorate([
  customElement("extref-ln-binding-list")
], ExtRefLnBindingList);
