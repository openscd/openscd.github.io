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
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../filtered-list.js";
import {
  createElement,
  identity,
  newActionEvent,
  selector
} from "../../foundation.js";
import {
  newIEDSubscriptionEvent,
  styles,
  SubscribeStatus
} from "./foundation.js";
const fcdaReferences = [
  "ldInst",
  "lnClass",
  "lnInst",
  "prefix",
  "doName",
  "daName"
];
function getFcdaReferences(elementContainingFcdaReferences) {
  return fcdaReferences.map((fcdaRef) => elementContainingFcdaReferences.getAttribute(fcdaRef) ? `[${fcdaRef}="${elementContainingFcdaReferences.getAttribute(fcdaRef)}"]` : "").join("");
}
export let SubscriberIEDListGoose = class extends LitElement {
  constructor() {
    super();
    this.subscribedIeds = [];
    this.availableIeds = [];
    this.onGOOSEDataSetEvent = this.onGOOSEDataSetEvent.bind(this);
    this.onIEDSubscriptionEvent = this.onIEDSubscriptionEvent.bind(this);
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      parentDiv.addEventListener("goose-dataset", this.onGOOSEDataSetEvent);
      parentDiv.addEventListener("ied-subscription", this.onIEDSubscriptionEvent);
    }
  }
  async onGOOSEDataSetEvent(event) {
    this.currentGseControl = event.detail.gseControl;
    this.currentDataset = event.detail.dataset;
    this.currentGooseIEDName = this.currentGseControl?.closest("IED")?.getAttribute("name");
    this.subscribedIeds = [];
    this.availableIeds = [];
    Array.from(this.doc.querySelectorAll(":root > IED")).filter((ied) => ied.getAttribute("name") != this.currentGooseIEDName).forEach((ied) => {
      const inputElements = ied.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
      let numberOfLinkedExtRefs = 0;
      if (!inputElements) {
        this.availableIeds.push({element: ied});
        return;
      }
      this.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        inputElements.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${this.currentGooseIEDName}]${getFcdaReferences(fcda)}`)) {
            numberOfLinkedExtRefs++;
          }
        });
      });
      if (numberOfLinkedExtRefs == 0) {
        this.availableIeds.push({element: ied});
        return;
      }
      if (numberOfLinkedExtRefs >= this.currentDataset.querySelectorAll("FCDA").length) {
        this.subscribedIeds.push({element: ied});
      } else {
        this.availableIeds.push({element: ied, partial: true});
      }
    });
    this.requestUpdate();
  }
  async onIEDSubscriptionEvent(event) {
    switch (event.detail.subscribeStatus) {
      case SubscribeStatus.Full: {
        this.unsubscribe(event.detail.element);
        break;
      }
      case SubscribeStatus.Partial: {
        this.subscribe(event.detail.element);
        break;
      }
      case SubscribeStatus.None: {
        this.subscribe(event.detail.element);
        break;
      }
    }
  }
  async subscribe(ied) {
    if (!ied.querySelector("LN0"))
      return;
    let inputsElement = ied.querySelector("LN0 > Inputs");
    if (!inputsElement)
      inputsElement = createElement(ied.ownerDocument, "Inputs", {});
    const actions = [];
    this.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
      if (!inputsElement.querySelector(`ExtRef[iedName=${this.currentGooseIEDName}]${getFcdaReferences(fcda)}`)) {
        const extRef = createElement(ied.ownerDocument, "ExtRef", {
          iedName: this.currentGooseIEDName,
          serviceType: "GOOSE",
          ldInst: fcda.getAttribute("ldInst") ?? "",
          lnClass: fcda.getAttribute("lnClass") ?? "",
          lnInst: fcda.getAttribute("lnInst") ?? "",
          prefix: fcda.getAttribute("prefix") ?? "",
          doName: fcda.getAttribute("doName") ?? "",
          daName: fcda.getAttribute("daName") ?? ""
        });
        if (inputsElement?.parentElement)
          actions.push({new: {parent: inputsElement, element: extRef}});
        else
          inputsElement?.appendChild(extRef);
      }
    });
    const title = "Connect";
    if (inputsElement.parentElement) {
      this.dispatchEvent(newActionEvent({title, actions}));
    } else {
      const inputAction = {
        new: {parent: ied.querySelector("LN0"), element: inputsElement}
      };
      this.dispatchEvent(newActionEvent({title, actions: [inputAction]}));
    }
  }
  unsubscribe(ied) {
    const actions = [];
    ied.querySelectorAll("LN0 > Inputs, LN > Inputs").forEach((inputs) => {
      this.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        const extRef = inputs.querySelector(`ExtRef[iedName=${this.currentGooseIEDName}]${getFcdaReferences(fcda)}`);
        if (extRef)
          actions.push({old: {parent: inputs, element: extRef}});
      });
    });
    this.dispatchEvent(newActionEvent({
      title: "Disconnect",
      actions: this.extendDeleteActions(actions)
    }));
  }
  extendDeleteActions(extRefDeleteActions) {
    if (!extRefDeleteActions.length)
      return [];
    const extendedDeleteActions = extRefDeleteActions;
    const inputsMap = {};
    for (const extRefDeleteAction of extRefDeleteActions) {
      const extRef = extRefDeleteAction.old.element;
      const inputsElement = extRefDeleteAction.old.parent;
      const id = identity(inputsElement);
      if (!inputsMap[id])
        inputsMap[id] = inputsElement.cloneNode(true);
      const linkedExtRef = inputsMap[id].querySelector(`ExtRef[iedName=${extRef.getAttribute("iedName")}]${getFcdaReferences(extRef)}`);
      if (linkedExtRef)
        inputsMap[id].removeChild(linkedExtRef);
    }
    Object.entries(inputsMap).forEach(([key, value]) => {
      if (value.children.length == 0) {
        const doc = extRefDeleteActions[0].old.parent.ownerDocument;
        const inputs = doc.querySelector(selector("Inputs", key));
        if (inputs && inputs.parentElement) {
          extendedDeleteActions.push({
            old: {parent: inputs.parentElement, element: inputs}
          });
        }
      }
    });
    return extendedDeleteActions;
  }
  updated() {
    if (this.subscriberWrapper) {
      this.subscriberWrapper.scrollTo(0, 0);
    }
  }
  renderSubscriber(status, element) {
    return html` <mwc-list-item
      @click=${() => {
      this.dispatchEvent(newIEDSubscriptionEvent(element, status ?? SubscribeStatus.None));
    }}
      graphic="avatar"
      hasMeta
    >
      <span>${element.getAttribute("name")}</span>
      <mwc-icon slot="graphic"
        >${status == SubscribeStatus.Full ? html`clear` : html`add`}</mwc-icon
      >
    </mwc-list-item>`;
  }
  renderUnSubscribers(ieds) {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriberIed.availableToSubscribe")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${ieds.length > 0 ? ieds.map((ied) => this.renderSubscriber(SubscribeStatus.None, ied.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderPartiallySubscribers(ieds) {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriberIed.partiallySubscribed")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${ieds.length > 0 ? ieds.map((ied) => this.renderSubscriber(SubscribeStatus.Partial, ied.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderFullSubscribers() {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriberIed.subscribed")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${this.subscribedIeds.length > 0 ? this.subscribedIeds.map((ied) => this.renderSubscriber(SubscribeStatus.Full, ied.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  render() {
    const partialSubscribedIeds = this.availableIeds.filter((ied) => ied.partial);
    const availableIeds = this.availableIeds.filter((ied) => !ied.partial);
    const gseControlName = this.currentGseControl?.getAttribute("name") ?? void 0;
    return html`
      <section tabindex="0">
        <h1>
          ${translate("subscription.subscriberIed.title", {
      selected: gseControlName ? this.currentGooseIEDName + " > " + gseControlName : "IED"
    })}
        </h1>
        ${this.currentGseControl ? html`<div class="subscriberWrapper">
              <filtered-list id="subscribedIeds">
                ${this.renderFullSubscribers()}
                ${this.renderPartiallySubscribers(partialSubscribedIeds)}
                ${this.renderUnSubscribers(availableIeds)}
              </filtered-list>
            </div>` : html`<mwc-list>
              <mwc-list-item noninteractive>
                <span>${translate("subscription.subscriberIed.noGooseMessageSelected")}</span>
              </mwc-list-item>
            </mwc-list>
          </div>`}
      </section>
    `;
  }
};
SubscriberIEDListGoose.styles = css`
    ${styles}
  `;
__decorate([
  property({attribute: false})
], SubscriberIEDListGoose.prototype, "doc", 2);
__decorate([
  query("div")
], SubscriberIEDListGoose.prototype, "subscriberWrapper", 2);
SubscriberIEDListGoose = __decorate([
  customElement("subscriber-ied-list-goose")
], SubscriberIEDListGoose);
