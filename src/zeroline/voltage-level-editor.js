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
  LitElement,
  customElement,
  html,
  property,
  css
} from "../../_snowpack/pkg/lit-element.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {selectors, startMove, styles, cloneElement} from "./foundation.js";
import "./bay-editor.js";
import {SubstationEditor} from "./substation-editor.js";
import {wizards} from "../wizards/wizard-library.js";
import {newActionEvent, newWizardEvent} from "../foundation.js";
import {until} from "../../_snowpack/pkg/lit-html/directives/until.js";
export let VoltageLevelEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = async () => {
      return [];
    };
  }
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc") ?? null;
  }
  get voltage() {
    const V = this.element.querySelector(selectors.VoltageLevel + " > Voltage");
    if (V === null)
      return null;
    const v = V.textContent ?? "";
    const m = V.getAttribute("multiplier");
    const u = m === null ? "V" : " " + m + "V";
    return v ? v + u : null;
  }
  openEditWizard() {
    const wizard = wizards["VoltageLevel"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openBayWizard() {
    const wizard = wizards["Bay"].create(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openLNodeWizard() {
    const wizard = wizards["LNode"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element,
          reference: this.element.nextSibling
        }
      }));
  }
  async renderIedContainer() {
    const ieds = await this.getAttachedIeds?.(this.element);
    return ieds?.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  renderHeader() {
    return html`<h2>
      ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      ${this.voltage === null ? "" : html`(${this.voltage})`}
      ${this.readonly ? html`` : html`<abbr title="${translate("add")}">
              <mwc-icon-button
                icon="playlist_add"
                @click=${() => this.openBayWizard()}
              ></mwc-icon-button>
            </abbr>
            <nav>
              <abbr title="${translate("lnode.tooltip")}">
                <mwc-icon-button
                  icon="account_tree"
                  @click=${() => this.openLNodeWizard()}
                ></mwc-icon-button>
              </abbr>
              <abbr title="${translate("duplicate")}">
                <mwc-icon-button
                  icon="content_copy"
                  @click=${() => cloneElement(this)}
                ></mwc-icon-button>
              </abbr>
              <abbr title="${translate("edit")}">
                <mwc-icon-button
                  icon="edit"
                  @click=${() => this.openEditWizard()}
                ></mwc-icon-button>
              </abbr>
              <abbr title="${translate("move")}">
                <mwc-icon-button
                  icon="forward"
                  @click=${() => startMove(this, VoltageLevelEditor, SubstationEditor)}
                ></mwc-icon-button>
              </abbr>
              <abbr title="${translate("remove")}">
                <mwc-icon-button
                  icon="delete"
                  @click=${() => this.remove()}
                ></mwc-icon-button>
              </abbr>
            </nav>`}
    </h2>`;
  }
  render() {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      ${until(this.renderIedContainer(), html`<span>${translate("zeroline.iedsloading")}</span>`)}
      <div id="bayContainer">
        ${Array.from(this.element?.querySelectorAll(selectors.Bay) ?? []).map((bay) => html`<bay-editor
            .element=${bay}
            .getAttachedIeds=${this.getAttachedIeds}
            ?readonly=${this.readonly}
          ></bay-editor>`)}
      </div>
    </section>`;
  }
};
VoltageLevelEditor.styles = css`
    ${styles}

    section {
      background-color: var(--mdc-theme-on-primary);
    }

    #bayContainer {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #bayContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
__decorate([
  property()
], VoltageLevelEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], VoltageLevelEditor.prototype, "readonly", 2);
__decorate([
  property()
], VoltageLevelEditor.prototype, "name", 1);
__decorate([
  property()
], VoltageLevelEditor.prototype, "desc", 1);
__decorate([
  property()
], VoltageLevelEditor.prototype, "voltage", 1);
__decorate([
  property({attribute: false})
], VoltageLevelEditor.prototype, "getAttachedIeds", 2);
VoltageLevelEditor = __decorate([
  customElement("voltage-level-editor")
], VoltageLevelEditor);
