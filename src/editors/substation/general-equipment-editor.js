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
  state,
  css
} from "../../../_snowpack/pkg/lit-element.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../action-pane.js";
import "./eq-function-editor.js";
import "./l-node-editor.js";
import {generalConductingEquipmentIcon} from "../../icons/icons.js";
import {getChildElementsByTagName} from "../../foundation.js";
export let GeneralEquipmentEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.showfunctions = false;
  }
  get header() {
    const name = this.element.getAttribute("name") ?? "";
    const desc = this.element.getAttribute("desc");
    if (!this.showfunctions)
      return `${name}`;
    return `${name} ${desc ? `—  ${desc}` : ""}`;
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
  renderEqFunctions() {
    if (!this.showfunctions)
      return html``;
    const eFunctions = getChildElementsByTagName(this.element, "EqFunction");
    return eFunctions.length ? html`${eFunctions.map((eFunction) => html` <eq-function-editor
              .doc=${this.doc}
              .element=${eFunction}
            ></eq-function-editor>`)}` : html``;
  }
  render() {
    if (this.showfunctions)
      return html`<action-pane label=${this.header}>
        ${this.renderLNodes()} ${this.renderEqFunctions()}
      </action-pane>`;
    return html`<action-icon label=${this.header}>
      <mwc-icon slot="icon">${generalConductingEquipmentIcon}</mwc-icon>
    </action-icon>`;
  }
};
GeneralEquipmentEditor.styles = css`
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
], GeneralEquipmentEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], GeneralEquipmentEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], GeneralEquipmentEditor.prototype, "readonly", 2);
__decorate([
  property({type: Boolean})
], GeneralEquipmentEditor.prototype, "showfunctions", 2);
__decorate([
  state()
], GeneralEquipmentEditor.prototype, "header", 1);
GeneralEquipmentEditor = __decorate([
  customElement("general-equipment-editor")
], GeneralEquipmentEditor);
