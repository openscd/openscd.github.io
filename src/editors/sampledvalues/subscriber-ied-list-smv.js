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
import "./elements/ied-element-smv.js";
import {
  createElement,
  newActionEvent
} from "../../foundation.js";
import {
  styles,
  SubscribeStatus
} from "./foundation.js";
import {
  emptyInputsDeleteActions,
  getFcdaReferences
} from "../../foundation/ied.js";
export let SubscriberIEDListSmv = class extends LitElement {
  constructor() {
    super();
    this.subscribedIeds = [];
    this.availableIeds = [];
    this.onSampledValuesDataSetEvent = this.onSampledValuesDataSetEvent.bind(this);
    this.onIEDSubscriptionEvent = this.onIEDSubscriptionEvent.bind(this);
    const parentDiv = this.closest('div[id="containerTemplates"]');
    if (parentDiv) {
      parentDiv.addEventListener("sampled-values-select", this.onSampledValuesDataSetEvent);
      parentDiv.addEventListener("ied-smv-subscription", this.onIEDSubscriptionEvent);
    }
  }
  async onSampledValuesDataSetEvent(event) {
    this.currentSampledValuesControl = event.detail.sampledValuesControl;
    this.currentDataset = event.detail.dataset;
    this.currentSampledValuesIEDName = this.currentSampledValuesControl?.closest("IED")?.getAttribute("name");
    this.subscribedIeds = [];
    this.availableIeds = [];
    Array.from(this.doc.querySelectorAll(":root > IED")).filter((ied) => ied.getAttribute("name") != this.currentSampledValuesIEDName).forEach((ied) => {
      const inputElements = ied.querySelectorAll(`LN0 > Inputs, LN > Inputs`);
      let numberOfLinkedExtRefs = 0;
      if (!inputElements) {
        this.availableIeds.push({element: ied});
        return;
      }
      this.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        inputElements.forEach((inputs) => {
          if (inputs.querySelector(`ExtRef[iedName=${this.currentSampledValuesIEDName}]${getFcdaReferences(fcda)}`)) {
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
        this.unsubscribe(event.detail.ied);
        break;
      }
      case SubscribeStatus.Partial: {
        this.subscribe(event.detail.ied);
        break;
      }
      case SubscribeStatus.None: {
        this.subscribe(event.detail.ied);
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
      if (!inputsElement.querySelector(`ExtRef[iedName=${this.currentSampledValuesIEDName}]${getFcdaReferences(fcda)}`)) {
        const extRef = createElement(ied.ownerDocument, "ExtRef", {
          iedName: this.currentSampledValuesIEDName,
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
  unsubscribe(ied) {
    const actions = [];
    ied.querySelectorAll("LN0 > Inputs, LN > Inputs").forEach((inputs) => {
      this.currentDataset.querySelectorAll("FCDA").forEach((fcda) => {
        const extRef = inputs.querySelector(`ExtRef[iedName=${this.currentSampledValuesIEDName}]${getFcdaReferences(fcda)}`);
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
  updated() {
    if (this.subscriberWrapper) {
      this.subscriberWrapper.scrollTo(0, 0);
    }
  }
  render() {
    const partialSubscribedIeds = this.availableIeds.filter((ied) => ied.partial);
    const availableIeds = this.availableIeds.filter((ied) => !ied.partial);
    const smvControlName = this.currentSampledValuesControl?.getAttribute("name") ?? void 0;
    return html`
      <section>
        <h1>
          ${translate("sampledvalues.subscriberIed.title", {
      selected: smvControlName ? this.currentSampledValuesIEDName + " > " + smvControlName : "IED"
    })}
        </h1>
        ${this.currentSampledValuesControl ? html`<div class="subscriberWrapper">
              <mwc-list>
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("sampledvalues.subscriberIed.subscribed")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${this.subscribedIeds.length > 0 ? this.subscribedIeds.map((ied) => html`<ied-element-smv
                          .status=${SubscribeStatus.Full}
                          .element=${ied.element}
                        ></ied-element-smv>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("sampledvalues.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
              <mwc-list>
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("sampledvalues.subscriberIed.partiallySubscribed")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${partialSubscribedIeds.length > 0 ? partialSubscribedIeds.map((ied) => html`<ied-element-smv
                          .status=${SubscribeStatus.Partial}
                          .element=${ied.element}
                        ></ied-element-smv>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("sampledvalues.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
              <mwc-list>
                <mwc-list-item noninteractive>
                  <span class="iedListTitle"
                    >${translate("sampledvalues.subscriberIed.availableToSubscribe")}</span
                  >
                </mwc-list-item>
                <li divider role="separator"></li>
                ${availableIeds.length > 0 ? availableIeds.map((ied) => html`<ied-element-smv
                          .status=${SubscribeStatus.None}
                          .element=${ied.element}
                        ></ied-element-smv>`) : html`<mwc-list-item graphic="avatar" noninteractive>
                      <span>${translate("sampledvalues.none")}</span>
                    </mwc-list-item>`}
              </mwc-list>
            </div>` : html`<mwc-list>
              <mwc-list-item noninteractive>
                <span class="iedListTitle">${translate("sampledvalues.subscriberIed.noSampledValuesSelected")}</span>
              </mwc-list-item>
            </mwc-list>
          </div>`}
      </section>
    `;
  }
};
SubscriberIEDListSmv.styles = css`
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
], SubscriberIEDListSmv.prototype, "doc", 2);
__decorate([
  query("div")
], SubscriberIEDListSmv.prototype, "subscriberWrapper", 2);
SubscriberIEDListSmv = __decorate([
  customElement("subscriber-ied-list-smv")
], SubscriberIEDListSmv);
