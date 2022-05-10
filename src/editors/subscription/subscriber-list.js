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
  newSubscriptionEvent,
  styles,
  SubscribeStatus,
  View
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
let view = View.GOOSE_PUBLISHER;
export let SubscriberList = class extends LitElement {
  constructor() {
    super();
    this.subscribedElements = [];
    this.availableElements = [];
    this.onGOOSEDataSetEvent = this.onGOOSEDataSetEvent.bind(this);
    this.onSubscriptionEvent = this.onSubscriptionEvent.bind(this);
    this.onIEDSelectEvent = this.onIEDSelectEvent.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      parentDiv.addEventListener("goose-dataset", this.onGOOSEDataSetEvent);
      parentDiv.addEventListener("subscription", this.onSubscriptionEvent);
      parentDiv.addEventListener("ied-select", this.onIEDSelectEvent);
      parentDiv.addEventListener("view", this.onViewChange);
    }
  }
  async onIEDSelectEvent(event) {
    if (!event.detail.ied)
      return;
    this.currentSelectedIed = event.detail.ied;
    this.resetElements();
    const subscribedInputs = this.currentSelectedIed.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
    this.doc.querySelectorAll("GSEControl").forEach((control) => {
      const ied = control.closest("IED");
      if (ied.getAttribute("name") == this.currentSelectedIed?.getAttribute("name"))
        return;
      if (subscribedInputs.length == 0) {
        this.availableElements.push({element: control});
        return;
      }
      let numberOfLinkedExtRefs = 0;
      const dataSet = ied.querySelector(`DataSet[name="${control.getAttribute("datSet")}"]`);
      if (!dataSet)
        return;
      dataSet.querySelectorAll("FCDA").forEach((fcda) => {
        subscribedInputs.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${ied.getAttribute("name")}]${getFcdaReferences(fcda)}`)) {
            numberOfLinkedExtRefs++;
          }
        });
      });
      if (numberOfLinkedExtRefs == 0) {
        this.availableElements.push({element: control});
        return;
      }
      if (numberOfLinkedExtRefs >= dataSet.querySelectorAll("FCDA").length) {
        this.subscribedElements.push({element: control});
      } else {
        this.availableElements.push({element: control, partial: true});
      }
    });
    this.requestUpdate();
  }
  async onGOOSEDataSetEvent(event) {
    if (!event.detail.dataset || !event.detail.gseControl)
      return;
    this.currentSelectedGseControl = event.detail.gseControl;
    this.currentUsedDataset = event.detail.dataset;
    this.currentGooseIEDName = this.currentSelectedGseControl?.closest("IED")?.getAttribute("name");
    this.resetElements();
    Array.from(this.doc.querySelectorAll(":root > IED")).filter((ied) => ied.getAttribute("name") != this.currentGooseIEDName).forEach((ied) => {
      const inputElements = ied.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
      let numberOfLinkedExtRefs = 0;
      if (!inputElements) {
        this.availableElements.push({element: ied});
        return;
      }
      this.currentUsedDataset.querySelectorAll("FCDA").forEach((fcda) => {
        inputElements.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${this.currentGooseIEDName}]${getFcdaReferences(fcda)}`)) {
            numberOfLinkedExtRefs++;
          }
        });
      });
      if (numberOfLinkedExtRefs == 0) {
        this.availableElements.push({element: ied});
        return;
      }
      if (numberOfLinkedExtRefs >= this.currentUsedDataset.querySelectorAll("FCDA").length) {
        this.subscribedElements.push({element: ied});
      } else {
        this.availableElements.push({element: ied, partial: true});
      }
    });
    this.requestUpdate();
  }
  async onSubscriptionEvent(event) {
    let elementToSubscribe = event.detail.element;
    if (view == View.GOOSE_SUBSCRIBER) {
      const dataSetName = event.detail.element.getAttribute("datSet");
      this.currentUsedDataset = event.detail.element.parentElement?.querySelector(`DataSet[name="${dataSetName}"]`);
      this.currentGooseIEDName = event.detail.element.closest("IED")?.getAttribute("name");
      elementToSubscribe = this.currentSelectedIed;
    }
    switch (event.detail.subscribeStatus) {
      case SubscribeStatus.Full: {
        this.unsubscribe(elementToSubscribe);
        break;
      }
      case SubscribeStatus.Partial: {
        this.subscribe(elementToSubscribe);
        break;
      }
      case SubscribeStatus.None: {
        this.subscribe(elementToSubscribe);
        break;
      }
    }
  }
  async onViewChange(event) {
    view = event.detail.view;
    this.currentSelectedIed = void 0;
    this.currentSelectedGseControl = void 0;
    this.resetElements();
    this.requestUpdate();
  }
  async subscribe(ied) {
    if (!ied.querySelector("LN0"))
      return;
    let inputsElement = ied.querySelector("LN0 > Inputs");
    if (!inputsElement)
      inputsElement = createElement(ied.ownerDocument, "Inputs", {});
    const actions = [];
    this.currentUsedDataset.querySelectorAll("FCDA").forEach((fcda) => {
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
      this.currentUsedDataset.querySelectorAll("FCDA").forEach((fcda) => {
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
  resetElements() {
    this.subscribedElements = [];
    this.availableElements = [];
  }
  updated() {
    if (this.subscriberWrapper) {
      this.subscriberWrapper.scrollTo(0, 0);
    }
  }
  renderSubscriber(status, element) {
    return html` <mwc-list-item
      @click=${() => {
      this.dispatchEvent(newSubscriptionEvent(element, status ?? SubscribeStatus.None));
    }}
      graphic="avatar"
      hasMeta
      >
      <span>${view == View.GOOSE_PUBLISHER ? element.getAttribute("name") : element.getAttribute("name") + ` (${element.closest("IED")?.getAttribute("name")})`}</span>
      <mwc-icon slot="graphic"
        >${status == SubscribeStatus.Full ? html`clear` : html`add`}</mwc-icon
      >
    </mwc-list-item>`;
  }
  renderUnSubscribers(elements) {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriber.availableToSubscribe")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${elements.length > 0 ? elements.map((element) => this.renderSubscriber(SubscribeStatus.None, element.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderPartiallySubscribers(elements) {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriber.partiallySubscribed")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${elements.length > 0 ? elements.map((element) => this.renderSubscriber(SubscribeStatus.Partial, element.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderFullSubscribers() {
    return html`<mwc-list-item noninteractive>
        <span class="iedListTitle"
          >${translate("subscription.subscriber.subscribed")}</span
        >
      </mwc-list-item>
      <li divider role="separator"></li>
      ${this.subscribedElements.length > 0 ? this.subscribedElements.map((element) => this.renderSubscriber(SubscribeStatus.Full, element.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderTitle() {
    const gseControlName = this.currentSelectedGseControl?.getAttribute("name") ?? void 0;
    return view == View.GOOSE_PUBLISHER ? html`<h1>
          ${translate("subscription.publisherGoose.subscriberTitle", {
      selected: gseControlName ? this.currentGooseIEDName + " > " + gseControlName : "GOOSE"
    })}
        </h1>` : html`<h1>
          ${translate("subscription.subscriberGoose.publisherTitle", {
      selected: this.currentSelectedIed ? this.currentSelectedIed.getAttribute("name") : "IED"
    })}
        </h1>`;
  }
  render() {
    return html`
      <section tabindex="0">
        ${this.renderTitle()}
        ${this.availableElements.length != 0 || this.subscribedElements.length != 0 ? html`<div class="subscriberWrapper">
              <filtered-list id="subscribedIeds">
                ${this.renderFullSubscribers()}
                ${this.renderPartiallySubscribers(this.availableElements.filter((element) => element.partial))}
                ${this.renderUnSubscribers(this.availableElements.filter((element) => !element.partial))}
              </filtered-list>
            </div>` : html`<mwc-list>
              <mwc-list-item noninteractive>
                <span>${view == View.GOOSE_PUBLISHER ? translate("subscription.subscriber.noGooseMessageSelected") : translate("subscription.subscriber.noIedSelected")}</span>
              </mwc-list-item>
            </mwc-list>
          </div>`}
      </section>
    `;
  }
};
SubscriberList.styles = css`
    ${styles}
  `;
__decorate([
  property({attribute: false})
], SubscriberList.prototype, "doc", 2);
__decorate([
  query("div")
], SubscriberList.prototype, "subscriberWrapper", 2);
SubscriberList = __decorate([
  customElement("subscriber-list")
], SubscriberList);
