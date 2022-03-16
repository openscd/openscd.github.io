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
import {newSampledValuesSelectEvent} from "../foundation.js";
import {smvIcon} from "../../../icons/icons.js";
export let SampledValuesMessage = class extends LitElement {
  constructor() {
    super(...arguments);
    this.onSampledValuesSelect = () => {
      const ln = this.element.parentElement;
      const dataset = ln?.querySelector(`DataSet[name=${this.element.getAttribute("datSet")}]`);
      this.dispatchEvent(newSampledValuesSelectEvent(this.element, dataset));
    };
  }
  render() {
    return html`<mwc-list-item @click=${this.onSampledValuesSelect} graphic="large">
      <span>${this.element.getAttribute("name")}</span>
      <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
    </mwc-list-item>`;
  }
};
__decorate([
  property({attribute: false})
], SampledValuesMessage.prototype, "element", 2);
SampledValuesMessage = __decorate([
  customElement("sampled-values-message")
], SampledValuesMessage);
