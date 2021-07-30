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
  property
} from "../../_snowpack/pkg/lit-element.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import {newActionEvent, newWizardEvent} from "../foundation.js";
import {wizards} from "../wizards/wizard-library.js";
import {cloneElement, selectors, startMove, styles} from "./foundation.js";
import "./voltage-level-editor.js";
export let SubstationEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = () => {
      return [];
    };
  }
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc");
  }
  openEditWizard() {
    const wizard = wizards["Substation"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openVoltageLevelWizard() {
    const wizard = wizards["VoltageLevel"].create(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  openLNodeWizard() {
    const wizard = wizards["LNode"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  remove() {
    this.dispatchEvent(newActionEvent({
      old: {
        parent: this.element.parentElement,
        element: this.element,
        reference: this.element.nextSibling
      }
    }));
  }
  renderIedContainer() {
    const ieds = this.getAttachedIeds?.(this.element) ?? [];
    return ieds?.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  renderHeader() {
    return html`
        <h1>
          ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
          ${this.readonly ? html`` : html`<abbr title="${translate("add")}">
                    <mwc-icon-button
                      icon="playlist_add"
                      @click=${() => this.openVoltageLevelWizard()}
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
                        @click=${() => startMove(this, SubstationEditor, SubstationEditor)}
                      ></mwc-icon-button>
                    </abbr>
                    <abbr title="${translate("remove")}">
                      <mwc-icon-button
                        icon="delete"
                        @click=${() => this.remove()}
                      ></mwc-icon-button>
                    </abbr>
                  </nav>`}
          </nav>
        </h1>
      `;
  }
  render() {
    return html`
      <section tabindex="0">
        ${this.renderHeader()} ${this.renderIedContainer()}
        ${Array.from(this.element.querySelectorAll(selectors.VoltageLevel)).map((voltageLevel) => html`<voltage-level-editor
              .element=${voltageLevel}
              .getAttachedIeds=${this.getAttachedIeds}
              ?readonly=${this.readonly}
            ></voltage-level-editor>`)}
      </section>
    `;
  }
};
SubstationEditor.styles = css`
    ${styles}

    section {
      overflow: hidden;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property({attribute: false})
], SubstationEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], SubstationEditor.prototype, "readonly", 2);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "desc", 1);
__decorate([
  property({attribute: false})
], SubstationEditor.prototype, "getAttachedIeds", 2);
SubstationEditor = __decorate([
  customElement("substation-editor")
], SubstationEditor);
