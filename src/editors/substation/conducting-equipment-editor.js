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
  query,
  css
} from "../../../web_modules/lit-element.js";
import {translate, get} from "../../../web_modules/lit-translate.js";
import {
  newWizardEvent,
  newActionEvent,
  getValue
} from "../../foundation.js";
import {typeIcons, typeNames} from "./conducting-equipment-types.js";
import {generalConductingEquipmentIcon, iedIcon} from "../../icons.js";
import {editlNode} from "./lnodewizard.js";
function isConductingEquipmentCreateOptions(options) {
  return options.parent !== void 0;
}
export let ConductingEquipmentEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc") ?? "";
  }
  get type() {
    return this.element.getAttribute("type") ?? "missing";
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(ConductingEquipmentEditor.wizard({element: this.element})));
  }
  openLNodeAddWizard() {
    this.dispatchEvent(newWizardEvent(editlNode(this.element)));
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
  render() {
    return html` <div id="container" tabindex="0">
      <input
        type="checkbox"
        href="#"
        class="menu-open"
        name="menu-open"
        id="menu-open"
      />
      <label class="type-icon-button" for="menu-open">
        ${typeIcons[this.type] ?? generalConductingEquipmentIcon}
        <h4 id="header">${this.name}</h4>
      </label>
      <mwc-icon-button
        class="menu-item edit"
        icon="edit"
        @click="${() => this.openEditWizard()}}"
      ></mwc-icon-button
      ><mwc-icon-button
        class="menu-item delete"
        id="delete"
        icon="delete"
        @click="${() => this.removeAction()}}"
      ></mwc-icon-button>
      <mwc-icon-button
        class="menu-item connect"
        id="lNodeButton"
        @click="${() => this.openLNodeAddWizard()}"
        >${iedIcon}</mwc-icon-button
      >
    </div>`;
  }
  static createAction(parent) {
    return (inputs, wizard) => {
      const name = getValue(inputs.find((i) => i.label === "name"));
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      const type = getValue(inputs.find((i) => i.label === "type"));
      const action = {
        new: {
          parent,
          element: new DOMParser().parseFromString(`<ConductingEquipment
              name="${name}"
              ${type === null ? "" : `type="${type === "ERS" ? "DIS" : type}"`}
              ${desc === null ? "" : `desc="${desc}"`}
            > ${type === "ERS" ? `<Terminal name="T1" cNodeName="grounded"></Terminal>` : ""}
            </ConductingEquipment>`, "application/xml").documentElement,
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
      let condunctingEquipmentAction;
      if (name === element.getAttribute("name") && desc === element.getAttribute("desc")) {
        condunctingEquipmentAction = null;
      } else {
        const newElement = element.cloneNode(false);
        newElement.setAttribute("name", name);
        if (desc === null)
          newElement.removeAttribute("desc");
        else
          newElement.setAttribute("desc", desc);
        condunctingEquipmentAction = {
          old: {element},
          new: {element: newElement}
        };
      }
      if (condunctingEquipmentAction)
        wizard.close();
      const actions = [];
      if (condunctingEquipmentAction)
        actions.push(condunctingEquipmentAction);
      return actions;
    };
  }
  static wizard(options) {
    const [
      heading,
      actionName,
      actionIcon,
      action
    ] = isConductingEquipmentCreateOptions(options) ? [
      get("conductingequipment.wizard.title.add"),
      get("add"),
      "add",
      ConductingEquipmentEditor.createAction(options.parent)
    ] : [
      get("conductingequipment.wizard.title.edit"),
      get("save"),
      "edit",
      ConductingEquipmentEditor.updateAction(options.element)
    ];
    const [name, desc] = isConductingEquipmentCreateOptions(options) ? ["", null] : [
      options.element.getAttribute("name"),
      options.element.getAttribute("desc"),
      options.element.getAttribute("type")
    ];
    const [reservedValues] = isConductingEquipmentCreateOptions(options) ? [
      Array.from(options.parent.querySelectorAll("ConductingEquipment")).map((condEq) => condEq.getAttribute("name"))
    ] : [
      Array.from(options.element.parentNode.querySelectorAll("ConductingEquipment")).map((condEq) => condEq.getAttribute("name")).filter((name2) => name2 !== options.element.getAttribute("name"))
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
            helper="${translate("conductingequipment.wizard.nameHelper")}"
            iconTrailing="title"
            required
            validationMessage="${translate("textfield.required")}"
            dialogInitialFocus
            .reservedValues="${reservedValues}"
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate("conductingequipment.wizard.descHelper")}"
            iconTrailing="description"
          ></wizard-textfield>`,
          ConductingEquipmentEditor.renderTypeSelector(options)
        ]
      }
    ];
  }
  static renderTypeSelector(options) {
    return isConductingEquipmentCreateOptions(options) ? html`<mwc-select
          required
          label="type"
          helper="${translate("conductingequipment.wizard.typeHelper")}"
          validationMessage="${translate("textfield.required")}"
          helperPersistant="true"
        >
          ${Object.keys(typeNames).map((v) => html`<mwc-list-item value="${v}">${typeNames[v]}</mwc-list-item>`)}
        </mwc-select>` : html`<mwc-select
          label="type"
          helper="${translate("conductingequipment.wizard.typeHelper")}"
          validationMessage="${translate("textfield.required")}"
          helperPersistant="true"
          disabled
        >
          <mwc-list-item selected value="0"
            >${options.element.getAttribute("type") === "DIS" && options.element.querySelector("Terminal")?.getAttribute("cNodeName") === "grounded" ? "Earth Switch" : typeNames[options.element.getAttribute("type") ?? ""]}</mwc-list-item
          >
        </mwc-select>`;
  }
};
ConductingEquipmentEditor.styles = css`
    :host {
      display: inline-block;
    }

    #container {
      width: 80px;
      height: 100px;
      margin: 20px;
      margin-top: 20px;
      margin-bottom: 20px;
      position: relative;
    }

    .type-icon-button {
      display: inline-block;
      background: var(--mdc-theme-surface);
      color: var(--mdc-theme-on-surface);
      margin: 0px;
      width: 80px;
      height: 100px;
      position: relative;
      z-index: 2;
    }

    .container:hover {
      -webkit-transform: scale(1.2, 1.2) translate3d(0, 0, 0);
      transform: scale(1.2, 1.2) translate3d(0, 0, 0);
    }

    #container:focus-within {
      outline: none;
    }

    #container:focus-within > .type-icon-button {
      background: var(--mdc-theme-on-primary);
      outline: none;
      -webkit-transition-timing-function: linear;
      transition-timing-function: linear;
      -webkit-transition-duration: 200ms;
      transition-duration: 200ms;
      -webkit-transform: scale(0.8, 0.8) translate3d(0, 0, 0);
      transform: scale(0.8, 0.8) translate3d(0, 0, 0);
    }

    .menu-open {
      display: none;
    }

    .menu-item:nth-child(3) {
      position: absolute;
      top: 25px;
      left: 15px;
      color: var(--mdc-theme-on-surface);
    }

    .menu-item:nth-child(4) {
      position: absolute;
      top: 25px;
      left: 15px;
      color: var(--mdc-theme-on-surface);
    }

    .menu-item:nth-child(5) {
      position: absolute;
      top: 25px;
      left: 15px;
      color: var(--mdc-theme-on-surface);
    }

    #container:focus-within > .menu-item {
      -webkit-transition-timing-function: cubic-bezier(0.935, 0, 0.34, 1.33);
      transition-timing-function: cubic-bezier(0.935, 0, 0.34, 1.33);
    }

    #container:focus-within > .menu-item:nth-child(3) {
      transition-duration: 200ms;
      -webkit-transition-duration: 200ms;
      -webkit-transform: translate3d(0px, -65px, 0);
      transform: translate3d(0px, -65px, 0);
    }

    #container:focus-within > .menu-item:nth-child(4) {
      transition-duration: 200ms;
      -webkit-transition-duration: 200ms;
      -webkit-transform: translate3d(0px, 65px, 0);
      transform: translate3d(0px, 65px, 0);
    }

    #container:focus-within > .menu-item:nth-child(5) {
      transition-duration: 200ms;
      -webkit-transition-duration: 200ms;
      -webkit-transform: translate3d(55px, 0px, 0);
      transform: translate3d(55px, 0px, 0);
    }

    #header {
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      color: var(--mdc-theme-on-surface);
      margin: 0px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .type-icon-button > svg {
      color: var(--mdc-theme-on-surface);
      width: 80px;
      height: 80px;
      position: relative;
    }
  `;
__decorate([
  property({type: Element})
], ConductingEquipmentEditor.prototype, "element", 2);
__decorate([
  property({type: Element})
], ConductingEquipmentEditor.prototype, "parent", 2);
__decorate([
  property({type: String})
], ConductingEquipmentEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], ConductingEquipmentEditor.prototype, "desc", 1);
__decorate([
  property({type: String})
], ConductingEquipmentEditor.prototype, "type", 1);
__decorate([
  query("h4")
], ConductingEquipmentEditor.prototype, "header", 2);
ConductingEquipmentEditor = __decorate([
  customElement("conducting-equipment-editor")
], ConductingEquipmentEditor);
