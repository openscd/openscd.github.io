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
  property
} from "../../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../../_snowpack/pkg/lit-translate.js";
import "../../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../../filtered-list.js";
import {
  createElement,
  newActionEvent
} from "../../../foundation.js";
import {
  newSmvSubscriptionEvent
} from "./foundation.js";
import {
  emptyInputsDeleteActions,
  getFcdaReferences
} from "../../../foundation/ied.js";
import {
  styles,
  SubscriberListContainer,
  SubscribeStatus,
  View
} from "../foundation.js";
let view = View.PUBLISHER;
export let SubscriberList = class extends SubscriberListContainer {
  constructor() {
    super();
    this.onIEDSelectEvent = this.onIEDSelectEvent.bind(this);
    this.onSmvSelectEvent = this.onSmvSelectEvent.bind(this);
    this.onIEDSubscriptionEvent = this.onIEDSubscriptionEvent.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    const parentDiv = this.closest(".container");
    if (parentDiv) {
      parentDiv.addEventListener("ied-select", this.onIEDSelectEvent);
      parentDiv.addEventListener("smv-select", this.onSmvSelectEvent);
      parentDiv.addEventListener("smv-subscription", this.onIEDSubscriptionEvent);
      parentDiv.addEventListener("view", this.onViewChange);
    }
  }
  async onIEDSelectEvent(event) {
    if (!event.detail.ied)
      return;
    this.currentSelectedIed = event.detail.ied;
    this.resetElements();
    const subscribedInputs = this.currentSelectedIed.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
    this.doc.querySelectorAll("SampledValueControl").forEach((control) => {
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
  async onSmvSelectEvent(event) {
    if (!event.detail.dataset || !event.detail.smvControl)
      return;
    this.currentSelectedSmvControl = event.detail.smvControl;
    this.currentUsedDataset = event.detail.dataset;
    this.currentSmvIedName = this.currentSelectedSmvControl?.closest("IED")?.getAttribute("name");
    this.subscribedElements = [];
    this.availableElements = [];
    Array.from(this.doc.querySelectorAll(":root > IED")).filter((ied) => ied.getAttribute("name") != this.currentSmvIedName).forEach((ied) => {
      const inputElements = ied.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
      let numberOfLinkedExtRefs = 0;
      if (!inputElements) {
        this.availableElements.push({element: ied});
        return;
      }
      this.currentUsedDataset.querySelectorAll("FCDA").forEach((fcda) => {
        inputElements.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${this.currentSmvIedName}]${getFcdaReferences(fcda)}`)) {
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
  async onIEDSubscriptionEvent(event) {
    let iedToSubscribe = event.detail.ied;
    if (view == View.SUBSCRIBER) {
      const dataSetName = event.detail.ied.getAttribute("datSet");
      this.currentUsedDataset = event.detail.ied.parentElement?.querySelector(`DataSet[name="${dataSetName}"]`);
      this.currentSmvIedName = event.detail.ied.closest("IED")?.getAttribute("name");
      iedToSubscribe = this.currentSelectedIed;
    }
    switch (event.detail.subscribeStatus) {
      case SubscribeStatus.Full: {
        this.unsubscribe(iedToSubscribe);
        break;
      }
      case SubscribeStatus.Partial: {
        this.subscribe(iedToSubscribe);
        break;
      }
      case SubscribeStatus.None: {
        this.subscribe(iedToSubscribe);
        break;
      }
    }
  }
  async onViewChange(event) {
    view = event.detail.view;
    this.currentSelectedIed = void 0;
    this.currentSelectedSmvControl = void 0;
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
      if (!inputsElement.querySelector(`ExtRef[iedName=${this.currentSmvIedName}]${getFcdaReferences(fcda)}`)) {
        const extRef = createElement(ied.ownerDocument, "ExtRef", {
          iedName: this.currentSmvIedName,
          serviceType: "SMV",
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
    if (inputsElement.parentElement)
      this.dispatchEvent(newActionEvent({title, actions}));
    else {
      const inputAction = {
        new: {parent: ied.querySelector("LN0"), element: inputsElement}
      };
      this.dispatchEvent(newActionEvent({title, actions: [inputAction]}));
    }
  }
  async unsubscribe(ied) {
    const actions = [];
    ied.querySelectorAll("LN0 > Inputs, LN > Inputs").forEach((inputs) => {
      this.currentUsedDataset.querySelectorAll("FCDA").forEach((fcda) => {
        const extRef = inputs.querySelector(`ExtRef[iedName=${this.currentSmvIedName}]${getFcdaReferences(fcda)}`);
        if (extRef)
          actions.push({old: {parent: inputs, element: extRef}});
      });
    });
    actions.push(...emptyInputsDeleteActions(actions));
    this.dispatchEvent(newActionEvent({
      title: "Disconnect",
      actions
    }));
  }
  renderSubscriber(status, element) {
    return html` <mwc-list-item
      @click=${() => {
      this.dispatchEvent(newSmvSubscriptionEvent(element, status ?? SubscribeStatus.None));
    }}
      graphic="avatar"
      hasMeta
    >
      <span
        >${view == View.PUBLISHER ? element.getAttribute("name") : element.getAttribute("name") + ` (${element.closest("IED")?.getAttribute("name")})`}</span
      >
      <mwc-icon slot="graphic"
        >${status == SubscribeStatus.Full ? html`clear` : html`add`}</mwc-icon
      >
    </mwc-list-item>`;
  }
  renderUnSubscribers(elements) {
    return html`<mwc-list-item noninteractive>
        <span
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
        <span>${translate("subscription.subscriber.partiallySubscribed")}</span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${elements.length > 0 ? elements.map((element) => this.renderSubscriber(SubscribeStatus.Partial, element.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderFullSubscribers() {
    return html`<mwc-list-item noninteractive>
        <span>${translate("subscription.subscriber.subscribed")}</span>
      </mwc-list-item>
      <li divider role="separator"></li>
      ${this.subscribedElements.length > 0 ? this.subscribedElements.map((element) => this.renderSubscriber(SubscribeStatus.Full, element.element)) : html`<mwc-list-item graphic="avatar" noninteractive>
            <span>${translate("subscription.none")}</span>
          </mwc-list-item>`}`;
  }
  renderTitle() {
    const gseControlName = this.currentSelectedSmvControl?.getAttribute("name") ?? void 0;
    return view == View.PUBLISHER ? html`<h1>
          ${translate("subscription.smv.publisherSmv.subscriberTitle", {
      selected: gseControlName ? this.currentSmvIedName + " > " + gseControlName : "Sampled Value"
    })}
        </h1>` : html`<h1>
          ${translate("subscription.smv.subscriberSmv.publisherTitle", {
      selected: this.currentSelectedIed ? this.currentSelectedIed.getAttribute("name") : "IED"
    })}
        </h1>`;
  }
  render() {
    return html`
      <section tabindex="0">
        ${this.renderTitle()}
        ${this.availableElements.length != 0 || this.subscribedElements.length != 0 ? html`<div class="wrapper">
              <filtered-list>
                ${this.renderFullSubscribers()}
                ${this.renderPartiallySubscribers(this.availableElements.filter((element) => element.partial))}
                ${this.renderUnSubscribers(this.availableElements.filter((element) => !element.partial))}
              </filtered-list>
            </div>` : html`<mwc-list>
              <mwc-list-item noninteractive>
                <span>${view == View.PUBLISHER ? translate("subscription.subscriber.noControlBlockSelected") : translate("subscription.subscriber.noIedSelected")}</span>
              </mwc-list-item>
            </mwc-list>
          </div>`}
      </section>
    `;
  }
};
SubscriberList.styles = css`
    ${styles}

    .wrapper {
      height: 100vh;
      overflow-y: scroll;
    }
  `;
__decorate([
  property()
], SubscriberList.prototype, "doc", 2);
SubscriberList = __decorate([
  customElement("subscriber-list-smv")
], SubscriberList);