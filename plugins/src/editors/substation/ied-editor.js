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
} from "../../../../_snowpack/pkg/lit-element.js";
import "../../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../../openscd/src/action-icon.js";
import {createClientLnWizard} from "../../wizards/clientln.js";
import {wizards} from "../../wizards/wizard-library.js";
import {newWizardEvent} from "../../../../openscd/src/foundation.js";
import {newActionEvent} from "../../../../_snowpack/link/packages/core/dist/foundation/deprecated/editor.js";
import {selectGseControlWizard} from "../../wizards/gsecontrol.js";
import {selectSampledValueControlWizard} from "../../wizards/sampledvaluecontrol.js";
import {selectReportControlWizard} from "../../wizards/reportcontrol.js";
import {removeIEDWizard} from "../../wizards/ied.js";
export let IedEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.editCount = -1;
  }
  get name() {
    return this.element.getAttribute("name") ?? "UNDEFINED";
  }
  openEditWizard() {
    const wizard = wizards["IED"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openReportControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectReportControlWizard(this.element)));
  }
  openGseControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectGseControlWizard(this.element)));
  }
  openSmvControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectSampledValueControlWizard(this.element)));
  }
  openCommunicationMapping() {
    const sendingIeds = Array.from(this.element.closest("SCL")?.querySelectorAll("IED") ?? []);
    const wizard = createClientLnWizard(sendingIeds, this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  removeIED() {
    const wizard = removeIEDWizard(this.element);
    if (wizard) {
      this.dispatchEvent(newWizardEvent(() => wizard));
    } else {
      this.dispatchEvent(newActionEvent({
        old: {parent: this.element.parentElement, element: this.element}
      }));
    }
  }
  render() {
    return html`<action-icon label="${this.name}" icon="developer_board">
      <mwc-fab
        slot="action"
        class="edit"
        mini
        @click="${() => this.openEditWizard()}"
        icon="edit"
      ></mwc-fab
      ><mwc-fab
        slot="action"
        class="delete"
        mini
        @click="${() => this.removeIED()}"
        icon="delete"
      ></mwc-fab
      ><mwc-fab
        slot="action"
        class="connectreport"
        mini
        @click="${() => this.openCommunicationMapping()}"
        icon="add_link"
      ></mwc-fab
      ></action-icon
    > `;
  }
};
__decorate([
  property({attribute: false})
], IedEditor.prototype, "doc", 2);
__decorate([
  property({type: Number})
], IedEditor.prototype, "editCount", 2);
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
