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
import {css, html, LitElement, property, state} from "../../_snowpack/pkg/lit-element.js";
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "../../_snowpack/pkg/@material/mwc-select.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../zeroline-pane.js";
import "./ied/ied-container.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {compareNames, getDescriptionAttribute, getNameAttribute} from "../foundation.js";
let iedEditorSelectedIedName;
function onOpenDocResetSelectedIed() {
  iedEditorSelectedIedName = void 0;
}
addEventListener("open-doc", onOpenDocResetSelectedIed);
export default class IedPlugin extends LitElement {
  get alphabeticOrderedIeds() {
    return this.doc ? Array.from(this.doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
  }
  set selectedIed(element) {
    iedEditorSelectedIedName = element ? getNameAttribute(element) : void 0;
  }
  get selectedIed() {
    if (iedEditorSelectedIedName === void 0) {
      iedEditorSelectedIedName = getNameAttribute(this.alphabeticOrderedIeds[0]);
    }
    return this.doc.querySelector(`:root > IED[name="${iedEditorSelectedIedName}"]`);
  }
  onSelect(event) {
    this.selectedIed = this.alphabeticOrderedIeds[event.detail.index];
    this.requestUpdate("selectedIed");
  }
  render() {
    const iedList = this.alphabeticOrderedIeds;
    if (iedList.length > 0) {
      let selectedIedElement = this.selectedIed;
      if (!selectedIedElement) {
        selectedIedElement = iedList[0];
      }
      return html`
        <section>
          <mwc-select
            id="iedSelect"
            label="${translate("iededitor.searchHelper")}"
            @selected=${this.onSelect}>
            ${iedList.map((ied) => html`
                  <mwc-list-item
                    ?selected=${ied == selectedIedElement}
                    value="${getNameAttribute(ied)}"
                  >${getNameAttribute(ied)} ${ied.hasAttribute("desc") ? translate("iededitor.searchHelperDesc", {
        description: getDescriptionAttribute(ied)
      }) : ""}
                  </mwc-list-item>`)}
          </mwc-select>
          <ied-container
            .element=${selectedIedElement}
            .nsdoc=${this.nsdoc}
          ></ied-container>
        </section>`;
    }
    return html`
          <h1>
            <span style="color: var(--base1)">${translate("iededitor.missing")}</span>
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
  property()
], IedPlugin.prototype, "nsdoc", 2);
__decorate([
  state()
], IedPlugin.prototype, "selectedIed", 1);
