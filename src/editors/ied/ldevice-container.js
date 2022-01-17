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
} from "../../../_snowpack/pkg/lit-element.js";
import "../../action-pane.js";
import "./ln-container.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {getDescriptionAttribute, getInstanceAttribute, getNameAttribute} from "../../foundation.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
export let LDeviceContainer = class extends LitElement {
  header() {
    const nameOrInst = getNameAttribute(this.element) ?? getInstanceAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    return html`${nameOrInst}${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  firstUpdated() {
    this.requestUpdate();
  }
  render() {
    const lnElements = Array.from(this.element.querySelectorAll(":scope > LN,LN0"));
    return html`<action-pane .label="${this.header()}">
      ${lnElements.length > 0 ? html`<abbr slot="action" title="${translate("iededitor.toggleChildElements")}">
        <mwc-icon-button-toggle
          on
          id="toggleButton"
          onIcon="keyboard_arrow_up"
          offIcon="keyboard_arrow_down"
          @click=${() => this.requestUpdate()}
        ></mwc-icon-button-toggle>
      </abbr>` : nothing}
      <div id="lnContainer">
        ${this.toggleButton?.on ? lnElements.map((server) => html`<ln-container
            .element=${server}
          ></ln-container>
          `) : nothing}
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
__decorate([
  query("#toggleButton")
], LDeviceContainer.prototype, "toggleButton", 2);
LDeviceContainer = __decorate([
  customElement("ldevice-container")
], LDeviceContainer);