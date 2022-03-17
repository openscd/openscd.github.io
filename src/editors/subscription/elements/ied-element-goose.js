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
  customElement,
  html,
  LitElement,
  property
} from "../../../../_snowpack/pkg/lit-element.js";
import "../../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import {newIEDSubscriptionEvent, SubscribeStatus} from "../foundation.js";
export let IEDElementGoose = class extends LitElement {
  constructor() {
    super(...arguments);
    this.onIedSelect = () => {
      this.dispatchEvent(newIEDSubscriptionEvent(this.element, this.status ?? SubscribeStatus.None));
    };
  }
  render() {
    return html`<mwc-list-item
      @click=${this.onIedSelect}
      graphic="avatar"
      hasMeta
    >
      <span>${this.element.getAttribute("name")}</span>
      <mwc-icon slot="graphic"
        >${this.status == SubscribeStatus.Full ? html`clear` : html`add`}</mwc-icon
      >
    </mwc-list-item>`;
  }
};
__decorate([
  property({attribute: false})
], IEDElementGoose.prototype, "element", 2);
__decorate([
  property({attribute: false})
], IEDElementGoose.prototype, "status", 2);
IEDElementGoose = __decorate([
  customElement("ied-element-goose")
], IEDElementGoose);
