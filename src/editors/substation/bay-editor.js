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
  customElement,
  LitElement,
  html,
  property,
  css,
  query
} from "../../../web_modules/lit-element.js";
import {
  newWizardEvent,
  newActionEvent,
  getValue
} from "../../foundation.js";
import {get, translate} from "../../../web_modules/lit-translate.js";
import {startMove, styles} from "./foundation.js";
import "./conducting-equipment-editor.js";
import {ConductingEquipmentEditor} from "./conducting-equipment-editor.js";
import {editlNode} from "./lnodewizard.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
function isBayCreateOptions(options) {
  return options.parent !== void 0;
}
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
  openLNodeAddWizard() {
    this.dispatchEvent(newWizardEvent(editlNode(this.element)));
  }
  openConductingEquipmentWizard() {
    if (!this.element)
      return;
    const event = newWizardEvent(ConductingEquipmentEditor.wizard({parent: this.element}));
    this.dispatchEvent(event);
  }
  removeAction() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.parent,
          element: this.element,
          reference: this.element.nextElementSibling
        }
      }));
  }
  renderHeader() {
    return html`<h3>
      ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      <mwc-icon-button
        icon="playlist_add"
        @click=${() => this.openConductingEquipmentWizard()}
      ></mwc-icon-button>
      <nav>
        <mwc-icon-button
          icon="device_hub"
          @click="${() => this.openLNodeAddWizard()}"
        ></mwc-icon-button>
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="forward"
          @click=${() => startMove(this, BayEditor, VoltageLevelEditor)}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="delete"
          @click=${() => this.removeAction()}
        ></mwc-icon-button>
      </nav>
    </h3>`;
  }
  render() {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      <div id="ceContainer">
        ${Array.from(this.element?.querySelectorAll("ConductingEquipment") ?? []).map((voltageLevel) => html`<conducting-equipment-editor
              .element=${voltageLevel}
              .parent=${this.element}
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
  static updateAction(element) {
    return (inputs, wizard) => {
      const name = inputs.find((i) => i.label === "name").value;
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      let bayAction;
      if (name === element.getAttribute("name") && desc === element.getAttribute("desc")) {
        bayAction = null;
      } else {
        const newElement = element.cloneNode(false);
        newElement.setAttribute("name", name);
        if (desc === null)
          newElement.removeAttribute("desc");
        else
          newElement.setAttribute("desc", desc);
        bayAction = {old: {element}, new: {element: newElement}};
      }
      if (bayAction)
        wizard.close();
      const actions = [];
      if (bayAction)
        actions.push(bayAction);
      return actions;
    };
  }
  static wizard(options) {
    const [heading, actionName, actionIcon, action] = isBayCreateOptions(options) ? [
      get("bay.wizard.title.add"),
      get("add"),
      "add",
      BayEditor.createAction(options.parent)
    ] : [
      get("bay.wizard.title.edit"),
      get("save"),
      "edit",
      BayEditor.updateAction(options.element)
    ];
    const [name, desc] = isBayCreateOptions(options) ? ["", null] : [
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
            iconTrailing="title"
            required
            validationMessage="${translate("textfield.required")}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate("bay.wizard.descHelper")}"
            iconTrailing="description"
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
      grid-template-columns: repeat(auto-fit, minmax(80px, auto));
    }
  `;
__decorate([
  property()
], BayEditor.prototype, "element", 2);
__decorate([
  property()
], BayEditor.prototype, "parent", 2);
__decorate([
  property({type: String})
], BayEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], BayEditor.prototype, "desc", 1);
__decorate([
  query("section")
], BayEditor.prototype, "container", 2);
__decorate([
  query("h3")
], BayEditor.prototype, "header", 2);
BayEditor = __decorate([
  customElement("bay-editor")
], BayEditor);
