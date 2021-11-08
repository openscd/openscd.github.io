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
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {startMove, styles, cloneSubstationElement} from "./foundation.js";
import {
  getChildElementsByTagName,
  newActionEvent,
  newWizardEvent
} from "../foundation.js";
import {wizards} from "../wizards/wizard-library.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
import "./conducting-equipment-editor.js";
export let BayEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = () => {
      return [];
    };
  }
  openEditWizard() {
    const wizard = wizards["Bay"].edit(this.element);
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
  renderIedContainer() {
    const ieds = this.getAttachedIeds?.(this.element) ?? [];
    return ieds?.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  render() {
    return html`<editor-container .element=${this.element} nomargin>
      <abbr slot="header" title="${translate("lnode.tooltip")}">
        <mwc-icon-button
          icon="account_tree"
          @click="${() => this.openLNodeWizard()}"
        ></mwc-icon-button>
      </abbr>
      <abbr slot="header" title="${translate("duplicate")}">
        <mwc-icon-button
          icon="content_copy"
          @click=${() => cloneSubstationElement(this)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="header" title="${translate("edit")}">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="header" title="${translate("move")}">
        <mwc-icon-button
          icon="forward"
          @click=${() => startMove(this, BayEditor, VoltageLevelEditor)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="header" title="${translate("remove")}">
        <mwc-icon-button
          icon="delete"
          @click=${() => this.remove()}
        ></mwc-icon-button>
      </abbr>
      ${this.renderIedContainer()}
      <div id="ceContainer">
        ${Array.from(getChildElementsByTagName(this.element, "ConductingEquipment")).map((voltageLevel) => html`<conducting-equipment-editor
              .element=${voltageLevel}
              ?readonly=${this.readonly}
            ></conducting-equipment-editor>`)}
      </div>
    </editor-container> `;
  }
};
BayEditor.styles = css`
    ${styles}

    #ceContainer {
      display: grid;
      grid-gap: 12px;
      padding: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
  property({attribute: false})
], BayEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], BayEditor.prototype, "readonly", 2);
__decorate([
  property({attribute: false})
], BayEditor.prototype, "getAttachedIeds", 2);
BayEditor = __decorate([
  customElement("bay-editor")
], BayEditor);
