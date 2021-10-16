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
import {newActionEvent, newWizardEvent} from "../foundation.js";
import {
  cloneSubstationElement,
  selectors,
  startMove,
  styles
} from "./foundation.js";
import {wizards} from "../wizards/wizard-library.js";
import "./voltage-level-editor.js";
import "../editor-container.js";
export let SubstationEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = () => {
      return [];
    };
  }
  openEditWizard() {
    const wizard = wizards["Substation"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openLNodeWizard() {
    const wizard = wizards["LNode"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  remove() {
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
    return ieds?.length ? html`<div id="iedcontainer" slot="container">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  render() {
    return html`
        <editor-container
          .element=${this.element}
          >
          ${this.renderIedContainer()}
          <abbr slot="header" title="${translate("lnode.tooltip")}">
            <mwc-icon-button
              icon="account_tree"
              @click=${() => this.openLNodeWizard()}
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
              @click=${() => startMove(this, SubstationEditor, SubstationEditor)}
            ></mwc-icon-button>
          </abbr>
          <abbr slot="header" title="${translate("remove")}">
            <mwc-icon-button
              icon="delete"
              @click=${() => this.remove()}
            ></mwc-icon-button> </abbr
        >${Array.from(this.element.querySelectorAll(selectors.VoltageLevel)).map((voltageLevel) => html`<voltage-level-editor
              slot="container"
              .element=${voltageLevel}
              .getAttachedIeds=${this.getAttachedIeds}
              ?readonly=${this.readonly}
            ></voltage-level-editor>`)}</editor-container>
      </section>
    `;
  }
};
SubstationEditor.styles = css`
    ${styles}
  `;
__decorate([
  property({attribute: false})
], SubstationEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], SubstationEditor.prototype, "readonly", 2);
__decorate([
  property({attribute: false})
], SubstationEditor.prototype, "getAttachedIeds", 2);
SubstationEditor = __decorate([
  customElement("substation-editor")
], SubstationEditor);
