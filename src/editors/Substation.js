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
import {LitElement, html, property, css} from "../../web_modules/lit-element.js";
import {translate, get} from "../../web_modules/lit-translate.js";
import "../../web_modules/@material/mwc-fab.js";
import {newWizardEvent} from "../foundation.js";
import {selectors, styles} from "./substation/foundation.js";
import "./substation/substation-editor.js";
import {SubstationEditor} from "./substation/substation-editor.js";
export default class SubstationPlugin extends LitElement {
  openCreateSubstationWizard() {
    this.dispatchEvent(newWizardEvent(SubstationEditor.wizard({parent: this.doc.documentElement})));
  }
  render() {
    if (!this.doc.querySelector(selectors.Substation))
      return html`<h1>
        <span style="color: var(--base1)"
          >${translate("substation.missing")}</span
        >
        <mwc-fab
          extended
          icon="add"
          label="${get("substation.wizard.title.add")}"
          @click=${() => this.openCreateSubstationWizard()}
        ></mwc-fab>
      </h1>`;
    return html`
      ${Array.from(this.doc.querySelectorAll(selectors.Substation) ?? []).map((substation) => html`<substation-editor .element=${substation}></substation-editor>`)}
    `;
  }
}
SubstationPlugin.styles = css`
    ${styles}

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property()
], SubstationPlugin.prototype, "doc", 2);
