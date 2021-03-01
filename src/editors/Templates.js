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
import {LitElement, html, property, css} from "../../_snowpack/pkg/lit-element.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {newActionEvent, newWizardEvent} from "../foundation.js";
import {styles} from "./templates/foundation.js";
import "./templates/enum-type-editor.js";
import {EnumTypeEditor} from "./templates/enum-type-editor.js";
const templates = fetch("public/xml/templates.scd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
export default class TemplatesPlugin extends LitElement {
  async openCreateEnumWizard() {
    if (!this.doc.querySelector(":root > DataTypeTemplates"))
      this.dispatchEvent(newActionEvent({
        new: {
          parent: this.doc.documentElement,
          element: this.doc.createElement("DataTypeTemplates"),
          reference: null
        }
      }));
    this.dispatchEvent(newWizardEvent(EnumTypeEditor.wizard({
      parent: this.doc.querySelector(":root > DataTypeTemplates"),
      templates: await templates
    })));
  }
  createDataTypeTemplates() {
    if (!this.doc.querySelector(":root > DataTypeTemplates"))
      this.dispatchEvent(newActionEvent({
        new: {
          parent: this.doc.documentElement,
          element: this.doc.createElement("DataTypeTemplates"),
          reference: null
        }
      }));
  }
  render() {
    if (!this.doc?.querySelector(":root > DataTypeTemplates"))
      return html`<h1>
        <span style="color: var(--base1)"
          >${translate("templates.missing")}</span
        >
        <mwc-fab
          extended
          icon="add"
          label="${translate("templates.add")}"
          @click=${() => this.createDataTypeTemplates()}
        ></mwc-fab>
      </h1>`;
    return html`
      <section tabindex="0">
        <h1>
          ${translate("scl.EnumType")}
          <nav>
            <abbr title="${translate("add")}">
              <mwc-icon-button
                icon="playlist_add"
                @click=${() => this.openCreateEnumWizard()}
              ></mwc-icon-button>
            </abbr>
          </nav>
        </h1>
        <mwc-list>
          ${Array.from(this.doc.querySelectorAll(":root > DataTypeTemplates > EnumType") ?? []).map((enumType) => html`<enum-type-editor .element=${enumType}></enum-type-editor>`)}
        </mwc-list>
      </section>
    `;
  }
}
TemplatesPlugin.styles = css`
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
], TemplatesPlugin.prototype, "doc", 2);
