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
import {css, html, LitElement, property, query, state} from "../../_snowpack/pkg/lit-element.js";
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "../../_snowpack/pkg/@material/mwc-select.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../zeroline-pane.js";
import "./ied/ied-container.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {compareNames, getDescriptionAttribute, getNameAttribute} from "../foundation.js";
export default class IedPlugin extends LitElement {
  constructor() {
    super(...arguments);
    this.currentSelectedIEDs = ":root > IED";
  }
  get alphabeticOrderedIeds() {
    return Array.from(this.doc?.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b));
  }
  onSelect(event) {
    const ied = this.alphabeticOrderedIeds[event.detail.index];
    this.currentSelectedIEDs = `:root > IED[name="${getNameAttribute(ied)}"]`;
  }
  render() {
    return this.doc?.querySelector(":root > IED") ? html`<section>
        <mwc-select
          id="iedSelect"
          label="${translate("iededitor.searchHelper")}"
          @selected=${this.onSelect}>
          ${this.alphabeticOrderedIeds.map((ied) => html`<mwc-list-item
                ?selected=${ied == this.alphabeticOrderedIeds[0]}
                value="${getNameAttribute(ied)}"
                >${getNameAttribute(ied)} ${ied.hasAttribute("desc") ? translate("iededitor.searchHelperDesc", {
      description: getDescriptionAttribute(ied)
    }) : ""}
              </mwc-list-item>`)}
        </mwc-select>
        ${Array.from(this.doc?.querySelectorAll(this.currentSelectedIEDs)).map((ied) => html`<ied-container
            .element=${ied}
          ></ied-container>`)}</section>` : html`<h1>
          <span style="color: var(--base1)"
            >${translate("iededitor.missing")}</span
          >
        </h1>`;
  }
}
IedPlugin.styles = css`
    :host {
      width: 100vw;
    }

    section {
      padding: 8px 12px 16px;
    }

    #iedSelect {
      width: 35vw;
      padding-bottom: 20px;
    }

    h1 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      line-height: 48px;
      padding-left: 0.3em;
    }
  `;
__decorate([
  property()
], IedPlugin.prototype, "doc", 2);
__decorate([
  state()
], IedPlugin.prototype, "currentSelectedIEDs", 2);
__decorate([
  query("#iedSelect")
], IedPlugin.prototype, "iedSelector", 2);
