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
} from "../../_snowpack/pkg/lit-element.js";
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "../action-icon.js";
import {startMove, getIcon} from "./foundation.js";
import {newActionEvent, newWizardEvent} from "../foundation.js";
import {BayEditor} from "./bay-editor.js";
import {wizards} from "../wizards/wizard-library.js";
export let ConductingEquipmentEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  openEditWizard() {
    const wizard = wizards["ConductingEquipment"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openLNodeWizard() {
    const wizard = wizards["LNode"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element,
          reference: this.element.nextSibling
        }
      }));
  }
  render() {
    return html`<action-icon label="${this.name}">
      <span slot="icon">${getIcon(this.element)}</span>
      <mwc-fab
        slot="action"
        mini
        @click="${() => this.openLNodeWizard()}"
        icon="account_tree"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        icon="edit"
        @click="${() => this.openEditWizard()}}"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        @click="${() => startMove(this, ConductingEquipmentEditor, [BayEditor])}"
        icon="forward"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        icon="delete"
        @click="${() => this.remove()}}"
      ></mwc-fab>
    </action-icon>`;
  }
};
ConductingEquipmentEditor.styles = css`
    :host(.moving) {
      opacity: 0.3;
    }
  `;
__decorate([
  property({attribute: false})
], ConductingEquipmentEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], ConductingEquipmentEditor.prototype, "name", 1);
ConductingEquipmentEditor = __decorate([
  customElement("conducting-equipment-editor")
], ConductingEquipmentEditor);
