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
  state
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-pane.js";
import "./eq-function-editor.js";
import "./l-node-editor.js";
import "./sub-equipment-editor.js";
import {getChildElementsByTagName} from "../../foundation.js";
export let TapChangerEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.showfunctions = false;
  }
  get header() {
    const name = this.element.getAttribute("name") ?? "";
    const desc = this.element.getAttribute("desc");
    return `TapChanger.${name} ${desc ? `—TapChanger.${desc}` : ""}`;
  }
  renderLNodes() {
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
    const eqFunctions = getChildElementsByTagName(this.element, "EqFunction");
    return html` ${eqFunctions.map((eqFunction) => html`<eq-function-editor
          .doc=${this.doc}
          .element=${eqFunction}
          ?showfunctions=${this.showfunctions}
        ></eq-function-editor>`)}`;
  }
  renderSubEquipments() {
    if (!this.showfunctions)
      return html``;
    const subEquipments = getChildElementsByTagName(this.element, "SubEquipment");
    return html` ${subEquipments.map((subEquipment) => html`<sub-equipment-editor
          .doc=${this.doc}
          .element=${subEquipment}
        ></sub-equipment-editor>`)}`;
  }
  render() {
    return html`<action-pane label=${this.header}> ${this.renderLNodes()}
    ${this.renderEqFunctions()} ${this.renderSubEquipments()}</action-icon>`;
  }
};
__decorate([
  property({attribute: false})
], TapChangerEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], TapChangerEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], TapChangerEditor.prototype, "showfunctions", 2);
__decorate([
  state()
], TapChangerEditor.prototype, "header", 1);
TapChangerEditor = __decorate([
  customElement("tapchanger-editor")
], TapChangerEditor);
