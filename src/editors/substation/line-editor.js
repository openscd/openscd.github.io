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
import "./conducting-equipment-editor.js";
import "./function-editor.js";
import "./general-equipment-editor.js";
import "./l-node-editor.js";
import {getChildElementsByTagName} from "../../foundation.js";
export let LineEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.showfunctions = false;
  }
  get header() {
    const name = this.element.getAttribute("name") ?? "";
    const desc = this.element.getAttribute("desc");
    return `${name} ${desc ? `—${desc}` : ""}`;
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
    return html`<action-pane label=${this.header}> ${this.renderConductingEquipments()}${this.renderGeneralEquipments()}${this.renderFunctions()}${this.renderLNodes()}
      </action-icon>`;
  }
};
__decorate([
  property({attribute: false})
], LineEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], LineEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], LineEditor.prototype, "showfunctions", 2);
__decorate([
  state()
], LineEditor.prototype, "header", 1);
LineEditor = __decorate([
  customElement("line-editor")
], LineEditor);
