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
import {LitElement, html, property, css, query} from "../../_snowpack/pkg/lit-element.js";
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "../../_snowpack/pkg/@material/mwc-radio.js";
import "../../_snowpack/pkg/@material/mwc-formfield.js";
import "./subscription/subscriber-list.js";
import "./subscription/goose-publisher-list.js";
import "./subscription/goose-subscriber-list.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {newViewEvent, View} from "./subscription/foundation.js";
let view = View.GOOSE_PUBLISHER;
export default class SubscriptionABBPlugin extends LitElement {
  constructor() {
    super();
    this.addEventListener("view", (evt) => {
      view = evt.detail.view;
      this.requestUpdate();
    });
  }
  firstUpdated() {
    view == View.GOOSE_PUBLISHER ? this.byGooseRadio.setAttribute("checked", "") : this.byIedRadio.setAttribute("checked", "");
  }
  render() {
    return html`<div>
      <mwc-formfield label="${translate("subscription.view.publisherView")}">
        <mwc-radio
          id="byGooseRadio"
          name="view"
          value="goose"
          @checked=${() => this.listDiv.dispatchEvent(newViewEvent(View.GOOSE_PUBLISHER))}
        ></mwc-radio>
      </mwc-formfield>
      <mwc-formfield label="${translate("subscription.view.subscriberView")}">
        <mwc-radio
          id="byIedRadio"
          name="view"
          value="ied"
          @checked=${() => this.listDiv.dispatchEvent(newViewEvent(View.GOOSE_SUBSCRIBER))}
        ></mwc-radio>
      </mwc-formfield>
      <div class="container">
        ${view == View.GOOSE_PUBLISHER ? html`<goose-publisher-list class="row" .doc=${this.doc}></goose-publisher-list>` : html`<goose-subscriber-list class="row" .doc=${this.doc}></goose-subscriber-list>`}
        <subscriber-list
          class="row"
          .doc=${this.doc}
        ></subscriber-list>
      </div>
    </div>`;
  }
}
SubscriptionABBPlugin.styles = css`
    :host {
      width: 100vw;
    }

    .container {
      display: flex;
      padding: 8px 6px 16px;
      height: 86vh;
    }

    .row {
      flex: 50%;
      margin: 0px 6px 0px;
      min-width: 300px;
      height: 100%;
      overflow-y: scroll;
    }
  `;
__decorate([
  property()
], SubscriptionABBPlugin.prototype, "doc", 2);
__decorate([
  query("#byGooseRadio")
], SubscriptionABBPlugin.prototype, "byGooseRadio", 2);
__decorate([
  query("#byIedRadio")
], SubscriptionABBPlugin.prototype, "byIedRadio", 2);
__decorate([
  query('div[class="container"]')
], SubscriptionABBPlugin.prototype, "listDiv", 2);
