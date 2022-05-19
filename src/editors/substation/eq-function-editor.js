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
  html,
  LitElement,
  property,
  customElement,
  state,
  css,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../../_snowpack/pkg/@material/mwc-menu.js";
import "../../action-pane.js";
import "./eq-sub-function-editor.js";
import {
  getChildElementsByTagName,
  newWizardEvent,
  tags
} from "../../foundation.js";
import {emptyWizard, wizards} from "../../wizards/wizard-library.js";
function childTags(element) {
  if (!element)
    return [];
  return tags[element.tagName].children.filter((child) => wizards[child].create !== emptyWizard);
}
export let EqFunctionEditor = class extends LitElement {
  get header() {
    const name = this.element.getAttribute("name");
    const desc = this.element.getAttribute("desc");
    const type = this.element.getAttribute("type");
    return `${name}${desc ? ` - ${desc}` : ""}${type ? ` (${type})` : ""}`;
  }
  openCreateWizard(tagName) {
    const wizard = wizards[tagName].create(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  firstUpdated() {
    this.addMenu.anchor = this.addButton;
  }
  renderLNodes() {
    const lNodes = getChildElementsByTagName(this.element, "LNode");
    return lNodes.length ? html`<div class="container lnode">
          ${lNodes.map((lNode) => html`<l-node-editor .element=${lNode}></l-node-editor>`)}
        </div>` : html``;
  }
  renderEqSubFunctions() {
    const eqSubFunctions = getChildElementsByTagName(this.element, "EqSubFunction");
    return html` ${eqSubFunctions.map((eqSubFunction) => html`<eq-sub-function-editor
          .element=${eqSubFunction}
        ></eq-sub-function-editor>`)}`;
  }
  renderAddButtons() {
    return childTags(this.element).map((child) => html`<mwc-list-item value="${child}"
          ><span>${child}</span></mwc-list-item
        >`);
  }
  render() {
    return html`<action-pane
      label="${this.header}"
      icon="functions"
      secondary
      highlighted
      ><abbr
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
        ></abbr
      >${this.renderLNodes()}${this.renderEqSubFunctions()}</action-pane
    >`;
  }
};
EqFunctionEditor.styles = css`
    .container.lnode {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
  property({attribute: false})
], EqFunctionEditor.prototype, "element", 2);
__decorate([
  state()
], EqFunctionEditor.prototype, "header", 1);
__decorate([
  query("mwc-menu")
], EqFunctionEditor.prototype, "addMenu", 2);
__decorate([
  query('mwc-icon-button[icon="playlist_add"]')
], EqFunctionEditor.prototype, "addButton", 2);
EqFunctionEditor = __decorate([
  customElement("eq-function-editor")
], EqFunctionEditor);
