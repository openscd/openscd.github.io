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
  query
} from "../../_snowpack/pkg/lit-element.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../action-pane.js";
import "./ied-editor.js";
import "./conducting-equipment-editor.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
import {
  getChildElementsByTagName,
  newActionEvent,
  newWizardEvent,
  tags
} from "../foundation.js";
import {emptyWizard, wizards} from "../wizards/wizard-library.js";
function childTags(element) {
  if (!element)
    return [];
  return tags[element.tagName].children.filter((child) => wizards[child].create !== emptyWizard);
}
import {startMove, styles, cloneSubstationElement} from "./foundation.js";
export let BayEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = () => {
      return [];
    };
  }
  get header() {
    const name = this.element.getAttribute("name") ?? "";
    const desc = this.element.getAttribute("desc");
    return `${name} ${desc ? `- ${desc}` : ""}`;
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
  openCreateWizard(tagName) {
    const wizard = wizards[tagName].create(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  firstUpdated() {
    this.addMenu.anchor = this.addButton;
  }
  renderIedContainer() {
    const ieds = this.getAttachedIeds?.(this.element) ?? [];
    return ieds?.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  renderAddButtons() {
    return childTags(this.element).map((child) => html`<mwc-list-item value="${child}"
          ><span>${child}</span></mwc-list-item
        >`);
  }
  render() {
    return html`<action-pane label="${this.header}">
      <abbr slot="action" title="${translate("lnode.tooltip")}">
        <mwc-icon-button
          icon="account_tree"
          @click="${() => this.openLNodeWizard()}"
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("duplicate")}">
        <mwc-icon-button
          icon="content_copy"
          @click=${() => cloneSubstationElement(this)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("edit")}">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("move")}">
        <mwc-icon-button
          icon="forward"
          @click=${() => startMove(this, BayEditor, VoltageLevelEditor)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate("remove")}">
        <mwc-icon-button
          icon="delete"
          @click=${() => this.remove()}
        ></mwc-icon-button>
      </abbr>
      <abbr
        slot="action"
        style="position:relative;"
        title="${translate("add")}"
      >
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.addMenu.open = true}
        ></mwc-icon-button
        ><mwc-menu
          corner="BOTTOM_RIGHT"
          menuCorner="END"
          @selected=${(e) => {
      const tagName = e.target.selected.value;
      this.openCreateWizard(tagName);
    }}
          >${this.renderAddButtons()}</mwc-menu
        >
      </abbr>
      ${this.renderIedContainer()}
      <div id="ceContainer">
        ${Array.from(getChildElementsByTagName(this.element, "ConductingEquipment")).map((voltageLevel) => html`<conducting-equipment-editor
              .element=${voltageLevel}
              ?readonly=${this.readonly}
            ></conducting-equipment-editor>`)}
      </div>
    </action-pane> `;
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
  property({type: String})
], BayEditor.prototype, "header", 1);
__decorate([
  property({attribute: false})
], BayEditor.prototype, "getAttachedIeds", 2);
__decorate([
  query("mwc-menu")
], BayEditor.prototype, "addMenu", 2);
__decorate([
  query('mwc-icon-button[icon="playlist_add"]')
], BayEditor.prototype, "addButton", 2);
BayEditor = __decorate([
  customElement("bay-editor")
], BayEditor);
