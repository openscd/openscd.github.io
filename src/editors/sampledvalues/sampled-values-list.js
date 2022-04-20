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
import "../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import {compareNames, getNameAttribute} from "../../foundation.js";
import {newSampledValuesSelectEvent, styles} from "./foundation.js";
import {smvIcon} from "../../icons/icons.js";
let selectedSmvMsg;
let selectedDataSet;
function onOpenDocResetSelectedSmvMsg() {
  selectedSmvMsg = void 0;
  selectedDataSet = void 0;
}
addEventListener("open-doc", onOpenDocResetSelectedSmvMsg);
export let SampledValuesList = class extends LitElement {
  get ieds() {
    return this.doc ? Array.from(this.doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
  }
  getSampledValuesControls(ied) {
    return Array.from(ied.querySelectorAll(":scope > AccessPoint > Server > LDevice > LN0 > SampledValueControl"));
  }
  onSmvSelect(element) {
    const ln = element.parentElement;
    const dataset = ln?.querySelector(`DataSet[name=${element.getAttribute("datSet")}]`);
    selectedSmvMsg = element;
    selectedDataSet = dataset;
    this.dispatchEvent(newSampledValuesSelectEvent(selectedSmvMsg, selectedDataSet));
  }
  renderSmv(element) {
    return html`<mwc-list-item @click=${() => this.onSmvSelect(element)} graphic="large">
      <span>${element.getAttribute("name")}</span>
      <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
    </mwc-list-item>`;
  }
  firstUpdated() {
    this.dispatchEvent(newSampledValuesSelectEvent(selectedSmvMsg, selectedDataSet ?? void 0));
  }
  render() {
    return html` <section>
      <h1>${translate("sampledvalues.sampledValuesList.title")}</h1>
      <mwc-list>
        ${this.ieds.map((ied) => ied.querySelector("SampledValueControl") ? html`
                <mwc-list-item noninteractive graphic="icon">
                  <span class="iedListTitle">${getNameAttribute(ied)}</span>
                  <mwc-icon slot="graphic">developer_board</mwc-icon>
                </mwc-list-item>
                <li divider role="separator"></li>
                ${this.getSampledValuesControls(ied).map((control) => this.renderSmv(control))}
              ` : ``)}
      </mwc-list>
    </section>`;
  }
};
SampledValuesList.styles = css`
    ${styles}

    mwc-list {
      height: 100vh;
      overflow-y: scroll;
    }

    .iedListTitle {
      font-weight: bold;
    }
  `;
__decorate([
  property({attribute: false})
], SampledValuesList.prototype, "doc", 2);
SampledValuesList = __decorate([
  customElement("sampled-values-list")
], SampledValuesList);
