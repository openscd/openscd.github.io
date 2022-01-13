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
  property,
  query
} from "../../_snowpack/pkg/lit-element.js";
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "../../_snowpack/pkg/@material/mwc-icon.js";
import "../action-icon.js";
import {createClientLnWizard} from "../wizards/clientln.js";
import {gooseIcon, smvIcon} from "../icons.js";
import {newWizardEvent} from "../foundation.js";
import {selectGseControlWizard} from "../wizards/gsecontrol.js";
import {selectSampledValueControlWizard} from "../wizards/sampledvaluecontrol.js";
export let IedEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "UNDEFINED";
  }
  openCommunicationMapping() {
    const sendingIeds = Array.from(this.element.closest("SCL")?.querySelectorAll("IED") ?? []);
    const wizard = createClientLnWizard(sendingIeds, this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openGseControlSelection() {
    const wizard = selectGseControlWizard(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openSmvControlSelection() {
    const wizard = selectSampledValueControlWizard(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  render() {
    return html`<action-icon label="${this.name}" icon="developer_board"
      ><mwc-fab
        slot="action"
        class="connectreport"
        mini
        @click="${() => this.openCommunicationMapping()}"
        icon="add_link"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        class="selectgse"
        mini
        @click="${() => this.openGseControlSelection()}"
        ><mwc-icon slot="icon">${gooseIcon}</mwc-icon></mwc-fab
      ><mwc-fab
        slot="action"
        class="selectsmv"
        mini
        @click="${() => this.openSmvControlSelection()}"
        ><mwc-icon slot="icon">${smvIcon}</mwc-icon></mwc-fab
      ></action-icon
    > `;
  }
};
__decorate([
  property({attribute: false})
], IedEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], IedEditor.prototype, "name", 1);
__decorate([
  query(".connectreport")
], IedEditor.prototype, "connectReport", 2);
IedEditor = __decorate([
  customElement("ied-editor")
], IedEditor);
