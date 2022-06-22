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
import {css, customElement, html} from "../../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../../_snowpack/pkg/lit-html.js";
import "../../action-pane.js";
import "./ldevice-container.js";
import {serverIcon} from "../../icons/ied-icons.js";
import {getDescriptionAttribute} from "../../foundation.js";
import {Container} from "./foundation.js";
export let ServerContainer = class extends Container {
  header() {
    const desc = getDescriptionAttribute(this.element);
    return html`Server${desc ? html` &mdash; ${desc}` : nothing}`;
  }
  render() {
    return html`<action-pane .label="${this.header()}">
      <mwc-icon slot="icon">${serverIcon}</mwc-icon>
      ${Array.from(this.element.querySelectorAll(":scope > LDevice")).map((server) => html`<ldevice-container
            .doc=${this.doc}
            .element=${server}
            .nsdoc=${this.nsdoc}
            .ancestors=${[...this.ancestors, this.element]}
          ></ldevice-container>`)}
    </action-pane>`;
  }
};
ServerContainer.styles = css``;
ServerContainer = __decorate([
  customElement("server-container")
], ServerContainer);
