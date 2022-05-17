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
  css
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-pane.js";
import "./eq-sub-function-editor.js";
import {getChildElementsByTagName} from "../../foundation.js";
export let EqFunctionEditor = class extends LitElement {
  get header() {
    const name = this.element.getAttribute("name");
    const desc = this.element.getAttribute("desc");
    const type = this.element.getAttribute("type");
    return `${name}${desc ? ` - ${desc}` : ""}${type ? ` (${type})` : ""}`;
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
  render() {
    return html`<action-pane
      label="${this.header}"
      icon="functions"
      secondary
      highlighted
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
EqFunctionEditor = __decorate([
  customElement("eq-function-editor")
], EqFunctionEditor);
