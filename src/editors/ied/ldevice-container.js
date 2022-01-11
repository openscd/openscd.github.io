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
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-pane.js";
import "./ln-container.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {getDescriptionAttribute, getInstanceAttribute, getNameAttribute} from "../../foundation.js";
export let LDeviceContainer = class extends LitElement {
  header() {
    const nameOrInst = getNameAttribute(this.element) ?? getInstanceAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    return html`${nameOrInst}${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  render() {
    return html`<action-pane .label="${this.header()}">
    <div id="lnContainer">
      ${Array.from(this.element.querySelectorAll(":scope > LN,LN0")).map((server) => html`<ln-container
          .element=${server}
        ></ln-container>`)}
    </div>
    </action-pane>`;
  }
};
LDeviceContainer.styles = css`
    #lnContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #lnContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }`;
__decorate([
  property({attribute: false})
], LDeviceContainer.prototype, "element", 2);
LDeviceContainer = __decorate([
  customElement("ldevice-container")
], LDeviceContainer);
