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
  state
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-icon.js";
import {identity, newActionEvent} from "../../foundation.js";
import {
  automationLogicalNode,
  controlLogicalNode,
  functionalLogicalNode,
  furtherPowerSystemEquipmentLogicalNode,
  generalLogicalNode,
  interfacingLogicalNode,
  measurementLogicalNode,
  nonElectricalLogicalNode,
  powerTransformerLogicalNode,
  protectionLogicalNode,
  protectionRelatedLogicalNode,
  qualityLogicalNode,
  supervisionLogicalNode,
  switchgearLogicalNode,
  systemLogicalNode,
  transformerLogicalNode
} from "../../icons/lnode.js";
export function getLNodeIcon(lNode) {
  const lnClassGroup = lNode.getAttribute("lnClass")?.charAt(0) ?? "";
  return lnClassIcons[lnClassGroup] ?? systemLogicalNode;
}
const lnClassIcons = {
  L: systemLogicalNode,
  A: automationLogicalNode,
  C: controlLogicalNode,
  F: functionalLogicalNode,
  G: generalLogicalNode,
  I: interfacingLogicalNode,
  K: nonElectricalLogicalNode,
  M: measurementLogicalNode,
  P: protectionLogicalNode,
  Q: qualityLogicalNode,
  R: protectionRelatedLogicalNode,
  S: supervisionLogicalNode,
  T: transformerLogicalNode,
  X: switchgearLogicalNode,
  Y: powerTransformerLogicalNode,
  Z: furtherPowerSystemEquipmentLogicalNode
};
export let LNodeEditor = class extends LitElement {
  get header() {
    const prefix = this.element.getAttribute("prefix") ?? "";
    const lnClass = this.element.getAttribute("lnClass");
    const lnInst = this.element.getAttribute("lnInst");
    const header = this.missingIedReference ? `${prefix} ${lnClass} ${lnInst}` : identity(this.element);
    return typeof header === "string" ? header : "";
  }
  get missingIedReference() {
    return this.element.getAttribute("iedName") === "None";
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element
        }
      }));
  }
  render() {
    return html`<action-icon
      label="${this.header}"
      ?secondary=${this.missingIedReference}
      ?highlighted=${this.missingIedReference}
      ><mwc-icon slot="icon">${getLNodeIcon(this.element)}</mwc-icon
      ><mwc-fab
        slot="action"
        mini
        icon="delete"
        @click="${() => this.remove()}}"
      ></mwc-fab
    ></action-icon>`;
  }
};
__decorate([
  property({attribute: false})
], LNodeEditor.prototype, "element", 2);
__decorate([
  state()
], LNodeEditor.prototype, "header", 1);
__decorate([
  state()
], LNodeEditor.prototype, "missingIedReference", 1);
LNodeEditor = __decorate([
  customElement("l-node-editor")
], LNodeEditor);
