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
  property,
  state
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../../_snowpack/pkg/@material/mwc-menu.js";
import "./conducting-equipment-editor.js";
import "./function-editor.js";
import "./general-equipment-editor.js";
import "./l-node-editor.js";
import "./line-editor.js";
import "./process-editor.js";
import "./substation-editor.js";
import "./process-editor.js";
import {styles} from "./foundation.js";
import {newWizardEvent, getChildElementsByTagName} from "../../foundation.js";
import {wizards} from "../../wizards/wizard-library.js";
export let ProcessEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.showfunctions = false;
  }
  get header() {
    const name = this.element.getAttribute("name") ?? "";
    const desc = this.element.getAttribute("desc");
    return `${name} ${desc ? `—${desc}` : ""}`;
  }
  openEditWizard() {
    const wizard = wizards["Process"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  renderConductingEquipments() {
    const ConductingEquipments = getChildElementsByTagName(this.element, "ConductingEquipment");
    return html` ${ConductingEquipments.map((ConductingEquipment) => html`<conducting-equipment-editor
          .doc=${this.doc}
          .element=${ConductingEquipment}
          ?showfunctions=${this.showfunctions}
        ></conducting-equipment-editor>`)}`;
  }
  renderGeneralEquipments() {
    const GeneralEquipments = getChildElementsByTagName(this.element, "GeneralEquipment");
    return html` ${GeneralEquipments.map((GeneralEquipment) => html`<general-equipment-editor
          .doc=${this.doc}
          .element=${GeneralEquipment}
          ?showfunctions=${this.showfunctions}
        ></general-equipment-editor>`)}`;
  }
  renderLines() {
    const Lines = getChildElementsByTagName(this.element, "Line");
    return html` ${Lines.map((Line) => html`<line-editor
          .doc=${this.doc}
          .element=${Line}
          ?showfunctions=${this.showfunctions}
        ></line-editor>`)}`;
  }
  renderSubstations() {
    const Substations = getChildElementsByTagName(this.element, "Substation");
    return html` ${Substations.map((Substation) => html`<substation-editor
          .doc=${this.doc}
          .element=${Substation}
          ?showfunctions=${this.showfunctions}
        ></substation-editor>`)}`;
  }
  renderProcesses() {
    const Processes = getChildElementsByTagName(this.element, "Process");
    return html` ${Processes.map((Process) => html`<process-editor
          .doc=${this.doc}
          .element=${Process}
          ?showfunctions=${this.showfunctions}
        ></process-editor>`)}`;
  }
  renderFunctions() {
    if (!this.showfunctions)
      return html``;
    const Functions = getChildElementsByTagName(this.element, "Function");
    return html` ${Functions.map((Function) => html`<function-editor
          .doc=${this.doc}
          .element=${Function}
          ?showfunctions=${this.showfunctions}
        ></function-editor>`)}`;
  }
  renderLNodes() {
    if (!this.showfunctions)
      return html``;
    const lNodes = getChildElementsByTagName(this.element, "LNode");
    return lNodes.length ? html`<div class="container lnode">
          ${lNodes.map((lNode) => html`<l-node-editor
                .doc=${this.doc}
                .element=${lNode}
              ></l-node-editor>`)}
        </div>` : html``;
  }
  render() {
    return html`<action-pane label=${this.header}>
      <abbr slot="action" title="${translate("edit")}">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
      </abbr>
      ${this.renderConductingEquipments()}${this.renderGeneralEquipments()}${this.renderFunctions()}${this.renderLNodes()}
      ${this.renderLines()} ${this.renderSubstations()}${this.renderProcesses()}
    </action-pane>`;
  }
};
ProcessEditor.styles = css`
    ${styles}

    :host(.moving) {
      opacity: 0.3;
    }

    abbr {
      text-decoration: none;
      border-bottom: none;
    }
  `;
__decorate([
  property({attribute: false})
], ProcessEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], ProcessEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], ProcessEditor.prototype, "showfunctions", 2);
__decorate([
  state()
], ProcessEditor.prototype, "header", 1);
ProcessEditor = __decorate([
  customElement("process-editor")
], ProcessEditor);
