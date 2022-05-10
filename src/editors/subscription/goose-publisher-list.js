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
import {compareNames, getNameAttribute, newWizardEvent} from "../../foundation.js";
import {newGOOSESelectEvent, styles} from "./foundation.js";
import {gooseIcon} from "../../icons/icons.js";
import {wizards} from "../../wizards/wizard-library.js";
import {classMap} from "../../../_snowpack/pkg/lit-html/directives/class-map.js";
let selectedGseControl;
let selectedDataSet;
function onOpenDocResetSelectedGooseMsg() {
  selectedGseControl = void 0;
  selectedDataSet = void 0;
}
addEventListener("open-doc", onOpenDocResetSelectedGooseMsg);
export let GoosePublisherList = class extends LitElement {
  get ieds() {
    return this.doc ? Array.from(this.doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
  }
  getGSEControls(ied) {
    return Array.from(ied.querySelectorAll(":scope > AccessPoint > Server > LDevice > LN0 > GSEControl"));
  }
  onGooseSelect(gseControl) {
    if (gseControl == selectedGseControl)
      return;
    const ln = gseControl.parentElement;
    const dataset = ln?.querySelector(`DataSet[name=${gseControl.getAttribute("datSet")}]`);
    selectedGseControl = gseControl;
    selectedDataSet = dataset;
    this.dispatchEvent(newGOOSESelectEvent(selectedGseControl, selectedDataSet));
    this.requestUpdate();
  }
  renderGoose(gseControl) {
    return html`<mwc-list-item
      @click=${() => this.onGooseSelect(gseControl)}
      graphic="large"
      hasMeta
    >
      <mwc-icon slot="graphic">${gooseIcon}</mwc-icon>
      <span>${gseControl.getAttribute("name")}</span>
      <mwc-icon-button
        class="${classMap({
      hidden: gseControl !== selectedGseControl
    })}"
        slot="meta"
        icon="edit"
        @click=${() => this.openEditWizard(gseControl)}
      ></mwc-icon-button>
    </mwc-list-item>`;
  }
  openEditWizard(gseControl) {
    const wizard = wizards["GSEControl"].edit(gseControl);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  firstUpdated() {
    this.dispatchEvent(newGOOSESelectEvent(selectedGseControl, selectedDataSet ?? void 0));
  }
  render() {
    return html` <section tabindex="0">
      <h1>${translate("subscription.publisherGoose.title")}</h1>
      <filtered-list>
        ${this.ieds.map((ied) => html`
              <mwc-list-item noninteractive graphic="icon">
                <span>${getNameAttribute(ied)}</span>
                <mwc-icon slot="graphic">developer_board</mwc-icon>
              </mwc-list-item>
              <li divider role="separator"></li>
              ${this.getGSEControls(ied).map((gseControl) => this.renderGoose(gseControl))}
            `)}
      </filtered-list>
    </section>`;
  }
};
GoosePublisherList.styles = css`
    ${styles}

    mwc-list-item {
      --mdc-list-item-meta-size: 48px;
    }

    mwc-icon-button.hidden {
      display: none;
    }
  `;
__decorate([
  property({attribute: false})
], GoosePublisherList.prototype, "doc", 2);
GoosePublisherList = __decorate([
  customElement("goose-publisher-list")
], GoosePublisherList);
