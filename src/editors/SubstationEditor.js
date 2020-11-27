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
  html,
  property,
  css,
  query
} from "../../web_modules/lit-element.js";
import {translate, get} from "../../web_modules/lit-translate.js";
import "../../web_modules/@material/mwc-button.js";
import "../../web_modules/@material/mwc-icon-button.js";
import "../../web_modules/@material/mwc-list/mwc-list-item.js";
import {
  newActionEvent,
  newWizardEvent,
  getValue
} from "../foundation.js";
import {selectors, styles} from "./substation/foundation.js";
import "./substation/voltage-level-editor.js";
import {VoltageLevelEditor} from "./substation/voltage-level-editor.js";
import {editlNode} from "./substation/lnodewizard.js";
export default class SubstationEditor extends LitElement {
  get element() {
    return this.doc?.querySelector(selectors.Substation) ?? null;
  }
  get name() {
    return this.element?.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element?.getAttribute("desc") ?? null;
  }
  openSubstationWizard() {
    const [heading, actionName, actionIcon] = this.element ? [get("substation.wizard.title.edit"), get("edit"), "edit"] : [get("substation.wizard.title.add"), get("add"), "add"];
    const event = newWizardEvent([
      {
        title: heading,
        primary: {
          icon: actionIcon,
          action: this.substationWizardAction,
          label: actionName
        },
        content: [
          html`<wizard-textfield
            .maybeValue=${this.name}
            helper="${translate("substation.wizard.nameHelper")}"
            label="name"
            required
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            .maybeValue=${this.desc}
            helper="${translate("substation.wizard.descHelper")}"
            label="desc"
            nullable
          ></wizard-textfield>`
        ]
      }
    ]);
    this.dispatchEvent(event);
  }
  openVoltageLevelWizard() {
    if (!this.element)
      return;
    const event = newWizardEvent(VoltageLevelEditor.wizard({parent: this.element}));
    this.dispatchEvent(event);
  }
  openLNodeWizard() {
    if (this.element)
      this.dispatchEvent(newWizardEvent(editlNode(this.element)));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.doc.documentElement,
          element: this.element,
          reference: this.element.nextElementSibling
        }
      }));
  }
  newUpdateAction(name, desc) {
    if (!this.element)
      throw new Error("Cannot edit a missing Substation");
    const newElement = this.element.cloneNode(false);
    newElement.setAttribute("name", name);
    if (desc === null)
      newElement.removeAttribute("desc");
    else
      newElement.setAttribute("desc", desc);
    return {
      old: {element: this.element},
      new: {element: newElement}
    };
  }
  newCreateAction(name, desc) {
    if (this.element)
      throw new Error("Will not create a second Substation");
    return {
      new: {
        parent: this.doc.documentElement,
        element: new DOMParser().parseFromString(`<Substation name="${name}"${desc === null ? "" : ` desc="${desc}"`}></Substation>`, "application/xml").documentElement,
        reference: null
      }
    };
  }
  substationWizardAction(inputs, dialog) {
    const name = inputs.find((i) => i.label === "name").value;
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    if (name === this.name && desc === this.desc)
      return [];
    const action = this.element ? this.newUpdateAction(name, desc) : this.newCreateAction(name, desc);
    dialog.close();
    return [action];
  }
  constructor() {
    super();
    this.substationWizardAction = this.substationWizardAction.bind(this);
  }
  renderHeader() {
    if (!this.element)
      return html`<h1>
        <span style="color: var(--base1)"
          >${translate("substation.missing")}</span
        >
        <mwc-icon-button
          icon="add"
          @click=${() => this.openSubstationWizard()}
        ></mwc-icon-button>
      </h1>`;
    return html`
      <h1>
        ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.openVoltageLevelWizard()}
        ></mwc-icon-button>
        <nav>
          <mwc-icon-button
            icon="account_tree"
            @click=${() => this.openLNodeWizard()}
          ></mwc-icon-button>
          <mwc-icon-button
            icon="edit"
            @click=${() => this.openSubstationWizard()}
          ></mwc-icon-button>
          <mwc-icon-button
            icon="delete"
            @click=${() => this.remove()}
          ></mwc-icon-button>
        </nav>
      </h1>
    `;
  }
  render() {
    return html`
      <main tabindex="0">
        ${this.renderHeader()}
        ${Array.from(this.element?.querySelectorAll(selectors.VoltageLevel) ?? []).map((voltageLevel) => html`<voltage-level-editor
              .element=${voltageLevel}
            ></voltage-level-editor>`)}
      </main>
    `;
  }
}
SubstationEditor.styles = css`
    ${styles}

    main {
      overflow: auto;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property()
], SubstationEditor.prototype, "doc", 2);
__decorate([
  property()
], SubstationEditor.prototype, "element", 1);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "desc", 1);
__decorate([
  query("main")
], SubstationEditor.prototype, "container", 2);
