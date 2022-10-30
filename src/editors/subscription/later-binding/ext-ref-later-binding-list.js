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
  cloneElement,
  getDescriptionAttribute,
  identity,
  newActionEvent
} from "../../../foundation.js";
import {
  newSubscriptionChangedEvent,
  styles,
  updateExtRefElement,
  serviceTypes
} from "../foundation.js";
import {
  getExtRefElements,
  getSubscribedExtRefElements,
  fcdaSpecification,
  inputRestriction,
  isSubscribed
} from "./foundation.js";
export let ExtRefLaterBindingList = class extends LitElement {
  constructor() {
    super();
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      this.onFcdaSelectEvent = this.onFcdaSelectEvent.bind(this);
      parentDiv.addEventListener("fcda-select", this.onFcdaSelectEvent);
    }
  }
  async onFcdaSelectEvent(event) {
    this.currentSelectedControlElement = event.detail.control;
    this.currentSelectedFcdaElement = event.detail.fcda;
    this.currentIedElement = this.currentSelectedFcdaElement ? this.currentSelectedFcdaElement.closest("IED") ?? void 0 : void 0;
  }
  unsupportedExtRefElement(extRef) {
    if (!extRef.hasAttribute("pLN") || !extRef.hasAttribute("pDO") || !extRef.hasAttribute("pDA") || !extRef.hasAttribute("pServT"))
      return false;
    if (!this.currentSelectedFcdaElement)
      return true;
    const fcda = fcdaSpecification(this.currentSelectedFcdaElement);
    const input = inputRestriction(extRef);
    if (fcda.cdc === null && input.cdc === null)
      return true;
    if (fcda.bType === null && input.bType === null)
      return true;
    if (serviceTypes[this.currentSelectedControlElement?.tagName ?? ""] !== extRef.getAttribute("pServT"))
      return true;
    return fcda.cdc !== input.cdc || fcda.bType !== input.bType;
  }
  unsubscribe(extRefElement) {
    if (!this.currentIedElement || !this.currentSelectedFcdaElement || !this.currentSelectedControlElement) {
      return null;
    }
    const clonedExtRefElement = cloneElement(extRefElement, {
      iedName: null,
      ldInst: null,
      prefix: null,
      lnClass: null,
      lnInst: null,
      doName: null,
      daName: null,
      serviceType: null,
      srcLDInst: null,
      srcPrefix: null,
      srcLNClass: null,
      srcLNInst: null,
      srcCBName: null
    });
    return {
      old: {element: extRefElement},
      new: {element: clonedExtRefElement}
    };
  }
  subscribe(extRefElement) {
    if (!this.currentIedElement || !this.currentSelectedFcdaElement || !this.currentSelectedControlElement) {
      return null;
    }
    return {
      old: {element: extRefElement},
      new: {
        element: updateExtRefElement(extRefElement, this.currentSelectedControlElement, this.currentSelectedFcdaElement)
      }
    };
  }
  getSubscribedExtRefElements() {
    return getSubscribedExtRefElements(this.doc.getRootNode(), this.controlTag, this.currentSelectedFcdaElement, this.currentSelectedControlElement, true);
  }
  getAvailableExtRefElements() {
    return getExtRefElements(this.doc.getRootNode(), this.currentSelectedFcdaElement, true).filter((extRefElement) => !isSubscribed(extRefElement));
  }
  renderTitle() {
    return html`<h1>
      ${translate(`subscription.laterBinding.extRefList.title`)}
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
              @click=${() => {
      const replaceAction = this.unsubscribe(extRefElement);
      if (replaceAction) {
        this.dispatchEvent(newActionEvent(replaceAction));
        this.dispatchEvent(newSubscriptionChangedEvent(this.currentSelectedControlElement, this.currentSelectedFcdaElement));
      }
    }}
              value="${identity(extRefElement)}"
            >
              <span>
                ${extRefElement.getAttribute("intAddr")}
                ${getDescriptionAttribute(extRefElement) ? html` (${getDescriptionAttribute(extRefElement)})` : nothing}
              </span>
              <span slot="secondary">${identity(extRefElement)}</span>
              <mwc-icon slot="graphic">swap_horiz</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.laterBinding.extRefList.noSubscribedExtRefs")}
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
              @click=${() => {
      const replaceAction = this.subscribe(extRefElement);
      if (replaceAction) {
        this.dispatchEvent(newActionEvent(replaceAction));
        this.dispatchEvent(newSubscriptionChangedEvent(this.currentSelectedControlElement, this.currentSelectedFcdaElement));
      }
    }}
              value="${identity(extRefElement)}"
            >
              <span>
                ${extRefElement.getAttribute("intAddr")}
                ${getDescriptionAttribute(extRefElement) ? html` (${getDescriptionAttribute(extRefElement)})` : nothing}
              </span>
              <span slot="secondary">${identity(extRefElement)}</span>
              <mwc-icon slot="graphic">arrow_back</mwc-icon>
            </mwc-list-item>`)}` : html`<mwc-list-item graphic="large" noninteractive>
            ${translate("subscription.laterBinding.extRefList.noAvailableExtRefs")}
          </mwc-list-item>`}
    `;
  }
  render() {
    return html` <section tabindex="0">
      ${this.currentSelectedControlElement && this.currentSelectedFcdaElement ? html`
            ${this.renderTitle()}
            <filtered-list>
              ${this.renderSubscribedExtRefs()} ${this.renderAvailableExtRefs()}
            </filtered-list>
          ` : html`
            <h1>
              ${translate("subscription.laterBinding.extRefList.noSelection")}
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
  property()
], ExtRefLaterBindingList.prototype, "controlTag", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentSelectedControlElement", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentSelectedFcdaElement", 2);
__decorate([
  state()
], ExtRefLaterBindingList.prototype, "currentIedElement", 2);
ExtRefLaterBindingList = __decorate([
  customElement("extref-later-binding-list")
], ExtRefLaterBindingList);
