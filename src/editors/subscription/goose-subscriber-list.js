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
  property
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../filtered-list.js";
import {compareNames, getNameAttribute} from "../../foundation.js";
import {newIEDSelectEvent, styles} from "./foundation.js";
let selectedIed;
function onOpenDocResetSelectedGooseMsg() {
  selectedIed = void 0;
}
addEventListener("open-doc", onOpenDocResetSelectedGooseMsg);
export let GooseSubscriberList = class extends LitElement {
  get ieds() {
    return this.doc ? Array.from(this.doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
  }
  onIedSelect(element) {
    selectedIed = element;
    this.dispatchEvent(newIEDSelectEvent(selectedIed));
  }
  firstUpdated() {
    this.dispatchEvent(newIEDSelectEvent(selectedIed));
  }
  render() {
    return html` <section tabindex="0">
      <h1>${translate("subscription.subscriberGoose.title")}</h1>
      <filtered-list>
        ${this.ieds.map((ied) => html`
              <mwc-list-item
                @click=${() => this.onIedSelect(ied)}
                graphic="icon"
              >
                <span>${getNameAttribute(ied)}</span>
                <mwc-icon slot="graphic">developer_board</mwc-icon>
              </mwc-list-item>
            `)}
      </filtered-list>
    </section>`;
  }
};
GooseSubscriberList.styles = css`
    ${styles}
  `;
__decorate([
  property({attribute: false})
], GooseSubscriberList.prototype, "doc", 2);
GooseSubscriberList = __decorate([
  customElement("goose-subscriber-list")
], GooseSubscriberList);
