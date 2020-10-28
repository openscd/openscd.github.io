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
import "./conducting-equipment-editor.js";
import {ConductingEquipmentEditor} from "./conducting-equipment-editor.js";
import {add, remove} from "./LNodeWizard.js";
import {iedIcon} from "../../icons.js";
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
    this.dispatchEvent(newWizardEvent(add(this.element)));
  }
  openLNodeRemoveWizard() {
    this.dispatchEvent(newWizardEvent(remove(this.element)));
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
        old: {parent: this.parent, element: this.element, reference: null}
      }));
  }
  renderHeader() {
    return html`<div id="header">
      <h3>
        ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      </h3>
      <div id="header-icon">
        <div style="position: relative;">
          <mwc-icon-button
            id="lNodeButton"
            @click="${() => this.lNodeMenu?.show()}"
            >${iedIcon}</mwc-icon-button
          >
          <mwc-menu id="lNodeMenu" .anchor=${this.lNodeButton}>
            <mwc-list-item @click=${() => this.openLNodeAddWizard()}
              >${translate("add")}</mwc-list-item
            >
            <mwc-list-item @click=${() => this.openLNodeRemoveWizard()}
              >${translate("remove")}</mwc-list-item
            >
          </mwc-menu>
        </div>
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="delete"
          @click=${() => this.removeAction()}
        ></mwc-icon-button>
        <span style="position:relative; float:right;">&#124;</span>
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.openConductingEquipmentWizard()}
        ></mwc-icon-button>
      </div>
    </div> `;
  }
  render() {
    return html`<div id="container">
      ${this.renderHeader()}
      ${Array.from(this.element?.querySelectorAll("ConductingEquipment") ?? []).map((voltageLevel) => html`<conducting-equipment-editor
            .element=${voltageLevel}
            .parent=${this.element}
          ></conducting-equipment-editor>`)}
    </div> `;
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
    #container {
      width: 320px;
      min-height: 320px;
      background-color: var(--mdc-theme-surface);
      margin: 10px;
    }

    #header {
      display: flex;
      color: var(--mdc-theme-on-surface);
    }

    h3 {
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: auto;
      padding-left: 0.5em;
    }

    #header-icon {
      display: flex;
      align-items: center;
    }

    #header > mwc-icon-button {
      position: relative;
      float: right;
      top: -5px;
    }
  `;
__decorate([
  property({type: Element})
], BayEditor.prototype, "element", 2);
__decorate([
  property({type: Element})
], BayEditor.prototype, "parent", 2);
__decorate([
  property({type: String})
], BayEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], BayEditor.prototype, "desc", 1);
__decorate([
  query("h3")
], BayEditor.prototype, "header", 2);
__decorate([
  query("#lNodeMenu")
], BayEditor.prototype, "lNodeMenu", 2);
__decorate([
  query("#lNodeButton")
], BayEditor.prototype, "lNodeButton", 2);
BayEditor = __decorate([
  customElement("bay-editor")
], BayEditor);
