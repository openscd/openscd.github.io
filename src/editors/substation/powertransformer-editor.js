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
import "../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../action-icon.js";
import {powerTransformerTwoWindingIcon} from "../../icons/icons.js";
import {wizards} from "../../wizards/wizard-library.js";
import {newActionEvent, newWizardEvent} from "../../foundation.js";
import {startMove} from "./foundation.js";
import {SubstationEditor} from "./substation-editor.js";
import {BayEditor} from "./bay-editor.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
export let PowerTransformerEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "UNDEFINED";
  }
  openEditWizard() {
    const wizard = wizards["PowerTransformer"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openLNodeWizard() {
    const wizard = wizards["LNode"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  removeElement() {
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
    return html`<action-icon
      label="${this.name}"
      .icon="${powerTransformerTwoWindingIcon}"
    >
      <mwc-fab
        slot="action"
        class="edit"
        mini
        @click="${() => this.openEditWizard()}"
        icon="edit"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        icon="delete"
        @click="${() => this.removeElement()}}"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        @click="${() => {
      startMove(this, PowerTransformerEditor, [
        SubstationEditor,
        VoltageLevelEditor,
        BayEditor
      ]);
    }}"
        icon="forward"
      ></mwc-fab>
      <mwc-fab
        slot="action"
        mini
        @click="${() => this.openLNodeWizard()}"
        icon="account_tree"
      ></mwc-fab>
    </action-icon> `;
  }
};
PowerTransformerEditor.styles = css`
    :host(.moving) {
      opacity: 0.3;
    }
  `;
__decorate([
  property({attribute: false})
], PowerTransformerEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], PowerTransformerEditor.prototype, "name", 1);
PowerTransformerEditor = __decorate([
  customElement("powertransformer-editor")
], PowerTransformerEditor);
