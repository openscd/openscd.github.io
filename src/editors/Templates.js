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
import {
  getReference,
  identity,
  newActionEvent,
  newWizardEvent
} from "../foundation.js";
import {styles} from "./templates/foundation.js";
import "../filtered-list.js";
import "./templates/enum-type-editor.js";
import {
  createDATypeWizard,
  dATypeWizard
} from "./templates/datype-wizards.js";
import {
  createDOTypeWizard,
  dOTypeWizard
} from "./templates/dotype-wizards.js";
import {EnumTypeEditor} from "./templates/enum-type-editor.js";
const templates = fetch("public/xml/templates.scd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
export default class TemplatesPlugin extends LitElement {
  async openCreateDOTypeWizard() {
    this.createDataTypeTemplates();
    this.dispatchEvent(newWizardEvent(createDOTypeWizard(this.doc.querySelector(":root > DataTypeTemplates"), await templates)));
  }
  openDOTypeWizard(identity2) {
    const wizard = dOTypeWizard(identity2, this.doc);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openDATypeWizard(identity2) {
    const wizard = dATypeWizard(identity2, this.doc);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  async openCreateDATypeWizard() {
    this.createDataTypeTemplates();
    this.dispatchEvent(newWizardEvent(createDATypeWizard(this.doc.querySelector(":root > DataTypeTemplates"), await templates)));
  }
  async openCreateEnumWizard() {
    this.createDataTypeTemplates();
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
          reference: getReference(this.doc.documentElement, "DataTypeTemplates")
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
      <div id="containerTemplates">
        <section tabindex="0">
          <h1>
            ${translate("scl.LNodeType")}
            <nav>
              <abbr title="${translate("add")}">
                <mwc-icon-button icon="playlist_add"></mwc-icon-button>
              </abbr>
            </nav>
          </h1>
          <filtered-list id="lnodetype">
            ${Array.from(this.doc.querySelectorAll(":root > DataTypeTemplates > LNodeType") ?? []).map((lnodetype) => html`<mwc-list-item
              twoline
              value="${identity(lnodetype)}"
              tabindex="0"
              hasMeta
              ><span>${lnodetype.getAttribute("id")}</span
              ><span slot="secondary">${lnodetype.getAttribute("lnClass")}</span></span><span slot="meta"
                >${lnodetype.querySelectorAll("DO").length}</span
              ></mwc-list-item
            >`)}
          </filtered-list>
        </section>
        <section tabindex="0">
          <h1>
            ${translate("scl.DOType")}
            <nav>
              <abbr title="${translate("add")}">
                <mwc-icon-button
                  icon="playlist_add"
                  @click=${() => this.openCreateDOTypeWizard()}
                ></mwc-icon-button>
              </abbr>
            </nav>
          </h1>
          <filtered-list
            id="dotypelist"
            @selected=${(e) => this.openDOTypeWizard(e.target.selected.value)}
          >
            ${Array.from(this.doc.querySelectorAll(":root > DataTypeTemplates > DOType") ?? []).map((dotype) => html`<mwc-list-item
                  twoline
                  value="${identity(dotype)}"
                  tabindex="0"
                  hasMeta
                  ><span>${dotype.getAttribute("id")}</span
                  ><span slot="secondary">${dotype.getAttribute("cdc")}</span></span><span slot="meta"
                    >${dotype.querySelectorAll("SDO, DA").length}</span
                  ></mwc-list-item
                >`)}
          </filtered-list>
        </section>
        <section tabindex="0">
          <h1>
            ${translate("scl.DAType")}
            <nav>
              <abbr title="${translate("add")}">
                <mwc-icon-button
                  icon="playlist_add"
                  @click=${() => this.openCreateDATypeWizard()}
                ></mwc-icon-button>
              </abbr>
            </nav>
          </h1>
          <filtered-list
            id="datypelist"
            @selected=${(e) => this.openDATypeWizard(e.target.selected.value)}
          >
            ${Array.from(this.doc.querySelectorAll(":root > DataTypeTemplates > DAType") ?? []).map((datype) => html`<mwc-list-item
                  value="${identity(datype)}"
                  tabindex="0"
                  hasMeta
                  ><span>${datype.getAttribute("id")}</span
                  ><span slot="meta"
                    >${datype.querySelectorAll("BDA").length}</span
                  ></mwc-list-item
                >`)}
          </filtered-list>
        </section>
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
      </div>
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

    #containerTemplates {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(400px, auto));
    }

    @media (max-width: 387px) {
      #containerTemplates {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
__decorate([
  property()
], TemplatesPlugin.prototype, "doc", 2);
