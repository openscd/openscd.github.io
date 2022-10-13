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
  compareNames,
  getDescriptionAttribute,
  identity,
  newActionEvent
} from "../../../foundation.js";
import {
  serviceTypes,
  styles,
  updateExtRefElement
} from "../foundation.js";
import {isSubscribedTo} from "./foundation.js";
export let ExtRefLaterBindingList = class extends LitElement {
  constructor() {
    super();
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      this.onFcdaSelectEvent = this.onFcdaSelectEvent.bind(this);
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
    return this.getExtRefElements().filter((extRefElement) => isSubscribedTo(serviceTypes[this.controlTag], this.currentIedElement, this.currentSelectedControlElement, this.currentSelectedFcdaElement, extRefElement));
  }
  getAvailableExtRefElements() {
    return this.getExtRefElements().filter((element) => !this.isSubscribed(element));
  }
  async onFcdaSelectEvent(event) {
    this.currentSelectedControlElement = event.detail.controlElement;
    this.currentSelectedFcdaElement = event.detail.fcda;
    this.currentIedElement = this.currentSelectedFcdaElement ? this.currentSelectedFcdaElement.closest("IED") ?? void 0 : void 0;
  }
  isSubscribed(extRefElement) {
    return extRefElement.hasAttribute("iedName") && extRefElement.hasAttribute("ldInst") && extRefElement.hasAttribute("prefix") && extRefElement.hasAttribute("lnClass") && extRefElement.hasAttribute("lnInst") && extRefElement.hasAttribute("doName") && extRefElement.hasAttribute("daName");
  }
  unsupportedExtRefElement(extRefElement) {
    return extRefElement.hasAttribute("pLN") || extRefElement.hasAttribute("pDO") || extRefElement.hasAttribute("pDA") || extRefElement.hasAttribute("pServT");
  }
  unsubscribe(extRefElement) {
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
      this.dispatchEvent(newActionEvent(this.unsubscribe(extRefElement)));
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
