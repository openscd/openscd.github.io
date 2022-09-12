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
  property,
  state
} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import {getDescriptionAttribute, getNameAttribute} from "../../foundation.js";
import {accessPointIcon} from "../../icons/ied-icons.js";
import "../../action-pane.js";
import "./server-container.js";
import {Container} from "./foundation.js";
export let AccessPointContainer = class extends Container {
  constructor() {
    super(...arguments);
    this.selectedLNClasses = [];
  }
  header() {
    const name = getNameAttribute(this.element);
    const desc = getDescriptionAttribute(this.element);
    return html`${name}${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  updated(_changedProperties) {
    super.updated(_changedProperties);
    if (_changedProperties.has("selectedLNClasses")) {
      this.requestUpdate("lnElements");
    }
  }
  get lnElements() {
    return Array.from(this.element.querySelectorAll(":scope > LN")).filter((element) => {
      const lnClass = element.getAttribute("lnClass") ?? "";
      return this.selectedLNClasses.includes(lnClass);
    });
  }
  render() {
    const lnElements = this.lnElements;
    return html`<action-pane .label="${this.header()}">
      <mwc-icon slot="icon">${accessPointIcon}</mwc-icon>
      ${Array.from(this.element.querySelectorAll(":scope > Server")).map((server) => html`<server-container
            .doc=${this.doc}
            .element=${server}
            .nsdoc=${this.nsdoc}
            .selectedLNClasses=${this.selectedLNClasses}
            .ancestors=${[...this.ancestors, this.element]}
          ></server-container>`)}
      <div id="lnContainer">
        ${lnElements.map((ln) => html`<ln-container
            .doc=${this.doc}
            .element=${ln}
            .nsdoc=${this.nsdoc}
            .ancestors=${[...this.ancestors, this.element]}
          ></ln-container> `)}
      </div>
    </action-pane>`;
  }
};
AccessPointContainer.styles = css`
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
    }
  `;
__decorate([
  property()
], AccessPointContainer.prototype, "selectedLNClasses", 2);
__decorate([
  state()
], AccessPointContainer.prototype, "lnElements", 1);
AccessPointContainer = __decorate([
  customElement("access-point-container")
], AccessPointContainer);
