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
import "../../action-pane.js";
import "./sub-function-editor.js";
import {getChildElementsByTagName} from "../../foundation.js";
export let SubFunctionEditor = class extends LitElement {
  get header() {
    const name = this.element.getAttribute("name");
    const desc = this.element.getAttribute("desc");
    const type = this.element.getAttribute("type");
    return `${name}${desc ? ` - ${desc}` : ""}${type ? ` (${type})` : ""}`;
  }
  renderSubFunctions() {
    const subfunctions = getChildElementsByTagName(this.element, "SubFunction");
    return html` ${subfunctions.map((subFunction) => html`<sub-function-editor
          .element=${subFunction}
        ></sub-function-editor>`)}`;
  }
  render() {
    return html`<action-pane label="${this.header}" icon="functions" secondary
      >${this.renderSubFunctions()}</action-pane
    >`;
  }
};
__decorate([
  property({attribute: false})
], SubFunctionEditor.prototype, "element", 2);
__decorate([
  state()
], SubFunctionEditor.prototype, "header", 1);
SubFunctionEditor = __decorate([
  customElement("sub-function-editor")
], SubFunctionEditor);
