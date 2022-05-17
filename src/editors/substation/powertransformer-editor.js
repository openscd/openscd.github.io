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
import "../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../action-icon.js";
import "../../action-pane.js";
import {powerTransformerTwoWindingIcon} from "../../icons/icons.js";
import {wizards} from "../../wizards/wizard-library.js";
import {
  getChildElementsByTagName,
  newActionEvent,
  newWizardEvent
} from "../../foundation.js";
import {startMove, styles} from "./foundation.js";
import {SubstationEditor} from "./substation-editor.js";
import {BayEditor} from "./bay-editor.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
export let PowerTransformerEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.showfunctions = false;
  }
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
  renderLNodes() {
    const lNodes = getChildElementsByTagName(this.element, "LNode");
    return lNodes.length ? html`<div class="container lnode">
          ${lNodes.map((lNode) => html`<l-node-editor .element=${lNode}></l-node-editor>`)}
        </div>` : html``;
  }
  renderEqFunctions() {
    if (!this.showfunctions)
      return html``;
    const eqFunctions = getChildElementsByTagName(this.element, "EqFunction");
    return html` ${eqFunctions.map((eqFunction) => html`<eq-function-editor .element=${eqFunction}></eq-function-editor>`)}`;
  }
  renderContentPane() {
    return html`<mwc-icon slot="icon" style="width:24px;height:24px"
        >${powerTransformerTwoWindingIcon}</mwc-icon
      >
      <abbr slot="action" title="${translate("lnode.tooltip")}">
        <mwc-icon-button
          slot="action"
          mini
          @click="${() => this.openLNodeWizard()}"
          icon="account_tree"
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("edit")}">
        <mwc-icon-button
          slot="action"
          mini
          icon="edit"
          @click="${() => this.openEditWizard()}}"
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("move")}">
        <mwc-icon-button
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
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("remove")}">
        <mwc-icon-button
          slot="action"
          mini
          icon="delete"
          @click="${() => this.removeElement()}}"
        ></mwc-icon-button>
      </abbr> `;
  }
  renderContentIcon() {
    return html`<mwc-icon slot="icon"
        >${powerTransformerTwoWindingIcon}</mwc-icon
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
      ></mwc-fab>`;
  }
  render() {
    if (this.showfunctions)
      return html`<action-pane label="${this.name}"
        >${this.renderContentPane()}${this.renderLNodes()}${this.renderEqFunctions()}</action-pane
      > `;
    return html`<action-icon label="${this.name}"
      >${this.renderContentIcon()}</action-icon
    > `;
  }
};
PowerTransformerEditor.styles = css`
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
], PowerTransformerEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], PowerTransformerEditor.prototype, "name", 1);
__decorate([
  property({type: Boolean})
], PowerTransformerEditor.prototype, "showfunctions", 2);
PowerTransformerEditor = __decorate([
  customElement("powertransformer-editor")
], PowerTransformerEditor);
