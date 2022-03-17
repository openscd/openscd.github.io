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
import "./elements/ied-element-goose.js";
import {
  createElement,
  identity,
  newActionEvent,
  selector
} from "../../foundation.js";
import {
  newGOOSESelectEvent,
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
const localState = {
  currentGseControl: void 0,
  currentDataset: void 0,
  currentGooseIEDName: void 0,
  subscribedIeds: [],
  availableIeds: []
};
export let SubscriberIEDListGoose = class extends LitElement {
  constructor() {
    super();
    this.onGOOSEDataSetEvent = this.onGOOSEDataSetEvent.bind(this);
    this.onIEDSubscriptionEvent = this.onIEDSubscriptionEvent.bind(this);
    const parentDiv = this.closest('div[id="containerTemplates"]');
    if (parentDiv) {
      parentDiv.addEventListener("goose-dataset", this.onGOOSEDataSetEvent);
      parentDiv.addEventListener("ied-subscription", this.onIEDSubscriptionEvent);
    }
  }
  async onGOOSEDataSetEvent(event) {
    console.log("onGOOSESelect");
    localState.currentGseControl = event.detail.gseControl;
    localState.currentDataset = event.detail.dataset;
    localState.currentGooseIEDName = localState.currentGseControl.closest("IED")?.getAttribute("name");
    localState.subscribedIeds = [];
    localState.availableIeds = [];
    Array.from(this.doc.querySelectorAll(":root > IED")).filter((ied) => ied.getAttribute("name") != localState.currentGooseIEDName).forEach((ied) => {
      const inputElements = ied.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
      let numberOfLinkedExtRefs = 0;
      if (!inputElements) {
        localState.availableIeds.push({element: ied});
        return;
      }
      localState.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        inputElements.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${localState.currentGooseIEDName}]${getFcdaReferences(fcda)}`)) {
            numberOfLinkedExtRefs++;
          }
        });
      });
      if (numberOfLinkedExtRefs == 0) {
        localState.availableIeds.push({element: ied});
        return;
      }
      if (numberOfLinkedExtRefs >= localState.currentDataset.querySelectorAll("FCDA").length) {
        localState.subscribedIeds.push({element: ied});
      } else {
        localState.availableIeds.push({element: ied, partial: true});
      }
    });
    this.requestUpdate();
  }
  async onIEDSubscriptionEvent(event) {
    console.log("onGOOSEIEDSub");
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
    localState.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
      if (!inputsElement.querySelector(`ExtRef[iedName=${localState.currentGooseIEDName}]${getFcdaReferences(fcda)}`)) {
        const extRef = createElement(ied.ownerDocument, "ExtRef", {
          iedName: localState.currentGooseIEDName,
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
    this.dispatchEvent(newGOOSESelectEvent(localState.currentGseControl, localState.currentDataset));
  }
  unsubscribe(ied) {
    const actions = [];
    ied.querySelectorAll("LN0 > Inputs, LN > Inputs").forEach((inputs) => {
      localState.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        const extRef = inputs.querySelector(`ExtRef[iedName=${localState.currentGooseIEDName}]${getFcdaReferences(fcda)}`);
        if (extRef)
          actions.push({old: {parent: inputs, element: extRef}});
      });
    });
    this.dispatchEvent(newActionEvent({
      title: "Disconnect",
      actions: this.extendDeleteActions(actions)
    }));
    this.dispatchEvent(newGOOSESelectEvent(localState.currentGseControl, localState.currentDataset));
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
  render() {
    const partialSubscribedIeds = localState.availableIeds.filter((ied) => ied.partial);
    const availableIeds = localState.availableIeds.filter((ied) => !ied.partial);
    const gseControlName = localState.currentGseControl?.getAttribute("name") ?? void 0;
    return html`
      <section>
        <h1>
          ${translate("subscription.subscriberIed.title", {
      selected: gseControlName ? localState.currentGooseIEDName + " > " + gseControlName : "IED"
    })}
        </h1>
        ${localState.currentGseControl ? html`<div class="subscriberWrapper">
              <mwc-list id="subscribedIeds">
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("subscription.subscriberIed.subscribed")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${localState.subscribedIeds.length > 0 ? localState.subscribedIeds.map((ied) => html`<ied-element-goose
                          .status=${SubscribeStatus.Full}
                          .element=${ied.element}
                        ></ied-element-goose>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("subscription.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
              <mwc-list id="partialSubscribedIeds">
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("subscription.subscriberIed.partiallySubscribed")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${partialSubscribedIeds.length > 0 ? partialSubscribedIeds.map((ied) => html`<ied-element-goose
                          .status=${SubscribeStatus.Partial}
                          .element=${ied.element}
                        ></ied-element-goose>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("subscription.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
              <mwc-list id="notSubscribedIeds">
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("subscription.subscriberIed.availableToSubscribe")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${availableIeds.length > 0 ? availableIeds.map((ied) => html`<ied-element-goose
                          .status=${SubscribeStatus.None}
                          .element=${ied.element}
                        ></ied-element-goose>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("subscription.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
            </div>` : html`<mwc-list>
              <mwc-list-item noninteractive>
                <span class="iedListTitle">${translate("subscription.subscriberIed.noGooseMessageSelected")}</span>
              </mwc-list-item>
            </mwc-list>
          </div>`}
      </section>
    `;
  }
};
SubscriberIEDListGoose.styles = css`
    ${styles}

    h1 {
      overflow: unset;
      white-space: unset;
      text-overflow: unset;
    }

    .subscriberWrapper {
      height: 100vh;
      overflow-y: scroll;
    }

    .iedListTitle {
      font-weight: bold;
    }
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
