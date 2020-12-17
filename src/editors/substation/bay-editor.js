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
} from "../../../web_modules/lit-element.js";
import {translate, get} from "../../../web_modules/lit-translate.js";
import {
  getValue,
  newActionEvent,
  newWizardEvent
} from "../../foundation.js";
import {
  isCreateOptions,
  startMove,
  styles,
  updateNamingAction
} from "./foundation.js";
import "./conducting-equipment-editor.js";
import {ConductingEquipmentEditor} from "./conducting-equipment-editor.js";
import {editlNode} from "./lnodewizard.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
export let BayEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc") ?? null;
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(BayEditor.wizard({element: this.element})));
  }
  openConductingEquipmentWizard() {
    if (!this.element)
      return;
    const event = newWizardEvent(ConductingEquipmentEditor.wizard({parent: this.element}));
    this.dispatchEvent(event);
  }
  openLNodeWizard() {
    this.dispatchEvent(newWizardEvent(editlNode(this.element)));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element,
          reference: this.element.nextElementSibling
        }
      }));
  }
  renderHeader() {
    return html`<h3>
      ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      <abbr title="${translate("add")}">
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.openConductingEquipmentWizard()}
        ></mwc-icon-button>
      </abbr>
      <nav>
        <abbr title="${translate("lnode.tooltip")}">
          <mwc-icon-button
            icon="account_tree"
            @click="${() => this.openLNodeWizard()}"
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
            @click=${() => startMove(this, BayEditor, VoltageLevelEditor)}
          ></mwc-icon-button>
        </abbr>
        <abbr title="${translate("remove")}">
          <mwc-icon-button
            icon="delete"
            @click=${() => this.remove()}
          ></mwc-icon-button>
        </abbr>
      </nav>
    </h3>`;
  }
  render() {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      <div id="ceContainer">
        ${Array.from(this.element?.querySelectorAll(":root > Substation > VoltageLevel > Bay > ConductingEquipment") ?? []).map((voltageLevel) => html`<conducting-equipment-editor
              .element=${voltageLevel}
            ></conducting-equipment-editor>`)}
      </div>
    </section> `;
  }
  static createAction(parent) {
    return (inputs, wizard) => {
      const name = getValue(inputs.find((i) => i.label === "name"));
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      const action = {
        new: {
          parent,
          element: new DOMParser().parseFromString(`<Bay
              name="${name}"
              ${desc === null ? "" : `desc="${desc}"`}
            ></Bay>`, "application/xml").documentElement,
          reference: null
        }
      };
      wizard.close();
      return [action];
    };
  }
  static wizard(options) {
    const [
      heading,
      actionName,
      actionIcon,
      action,
      name,
      desc
    ] = isCreateOptions(options) ? [
      get("bay.wizard.title.add"),
      get("add"),
      "add",
      BayEditor.createAction(options.parent),
      "",
      ""
    ] : [
      get("bay.wizard.title.edit"),
      get("save"),
      "edit",
      updateNamingAction(options.element),
      options.element.getAttribute("name"),
      options.element.getAttribute("desc")
    ];
    return [
      {
        title: heading,
        primary: {
          icon: actionIcon,
          label: actionName,
          action
        },
        content: [
          html`<wizard-textfield
            label="name"
            .maybeValue=${name}
            helper="${translate("bay.wizard.nameHelper")}"
            required
            validationMessage="${translate("textfield.required")}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate("bay.wizard.descHelper")}"
          ></wizard-textfield>`
        ]
      }
    ];
  }
};
BayEditor.styles = css`
    ${styles}

    section {
      margin: 0px;
    }

    #ceContainer {
      display: grid;
      grid-gap: 12px;
      padding: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
  property()
], BayEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], BayEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], BayEditor.prototype, "desc", 1);
BayEditor = __decorate([
  customElement("bay-editor")
], BayEditor);
