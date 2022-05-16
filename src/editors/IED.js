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
import "./ied/ied-container.js";
import "./ied/element-path.js";
import "./substation/zeroline-pane.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {compareNames, getDescriptionAttribute, getNameAttribute} from "../foundation.js";
let iedEditorSelectedIed;
function onOpenDocResetSelectedIed() {
  iedEditorSelectedIed = void 0;
}
addEventListener("open-doc", onOpenDocResetSelectedIed);
export default class IedPlugin extends LitElement {
  get alphabeticOrderedIeds() {
    return this.doc ? Array.from(this.doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
  }
  set selectedIed(element) {
    iedEditorSelectedIed = element;
  }
  get selectedIed() {
    if (iedEditorSelectedIed === void 0 || iedEditorSelectedIed.parentElement === null) {
      const iedList = this.alphabeticOrderedIeds;
      if (iedList.length > 0) {
        iedEditorSelectedIed = iedList[0];
      }
    }
    return iedEditorSelectedIed;
  }
  onSelect(event) {
    this.selectedIed = this.alphabeticOrderedIeds[event.detail.index];
    this.requestUpdate("selectedIed");
  }
  render() {
    const iedList = this.alphabeticOrderedIeds;
    if (iedList.length > 0) {
      return html`
        <section>
          <div class="header">
            <mwc-select
              class="iedSelect"
              label="${translate("iededitor.searchHelper")}"
              @selected=${this.onSelect}>
              ${iedList.map((ied) => html`
                    <mwc-list-item
                      ?selected=${ied == this.selectedIed}
                      value="${getNameAttribute(ied)}"
                    >${getNameAttribute(ied)} ${ied.hasAttribute("desc") ? translate("iededitor.searchHelperDesc", {
        description: getDescriptionAttribute(ied)
      }) : ""}
                    </mwc-list-item>`)}
            </mwc-select>
            <element-path class="elementPath"></element-path>
          </div>
          <ied-container
            .element=${this.selectedIed}
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

    .iedSelect {
      width: 35vw;
      padding-bottom: 20px;
    }

    .header {
      display: flex;
    }

    .elementPath {
      margin-left: auto;
      padding-right: 12px;
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
