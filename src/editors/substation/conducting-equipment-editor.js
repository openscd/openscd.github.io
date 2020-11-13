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
import {generalConductingEquipmentIcon} from "../../icons.js";
import {startMove} from "./foundation.js";
import {typeIcons, typeNames} from "./conducting-equipment-types.js";
import {editlNode} from "./lnodewizard.js";
import {BayEditor} from "./bay-editor.js";
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
  remove() {
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
    return html`
      <div id="container" tabindex="0">
        ${typeIcons[this.type] ?? generalConductingEquipmentIcon}
        <h4>${this.name}</h4>
        <mwc-icon-button
          class="menu-item left"
          @click="${() => this.openLNodeAddWizard()}"
          icon="device_hub"
        ></mwc-icon-button>
        <mwc-icon-button
          class="menu-item up"
          icon="edit"
          @click="${() => this.openEditWizard()}}"
        ></mwc-icon-button>
        <mwc-icon-button
          class="menu-item right"
          @click="${() => startMove(this, ConductingEquipmentEditor, BayEditor)}"
          icon="forward"
        ></mwc-icon-button>
        <mwc-icon-button
          class="menu-item down"
          icon="delete"
          @click="${() => this.remove()}}"
        ></mwc-icon-button>
      </div>
    `;
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
    #container {
      color: var(--mdc-theme-on-surface);
      width: 80px;
      height: 100px;
      margin: auto;
      position: relative;
      opacity: 1;
      transition: all 200ms linear;
    }

    #container.moving {
      opacity: 0.3;
    }

    #container:focus {
      outline: none;
    }

    #container > svg {
      color: var(--mdc-theme-on-surface);
      width: 80px;
      height: 80px;
      transition: transform 150ms linear, box-shadow 200ms linear;
      outline-color: var(--mdc-theme-primary);
      outline-style: solid;
      outline-width: 0px;
    }

    #container:focus > svg {
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
    }

    #container:hover > svg {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    #container:focus-within > svg {
      outline: 2px solid var(--mdc-theme-primary);
      background: var(--mdc-theme-on-primary);
      transform: scale(0.8);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    .menu-item {
      color: var(--mdc-theme-on-surface);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 200ms linear;
      position: absolute;
      top: 15px;
      left: 15px;
      pointer-events: none;
      opacity: 0;
    }

    #container:focus-within > .menu-item {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 250ms linear;
      pointer-events: auto;
      opacity: 1;
    }

    #container:focus-within > .menu-item.up {
      transform: translate(0px, -55px);
    }

    #container:focus-within > .menu-item.down {
      transform: translate(0px, 57px);
    }

    #container:focus-within > .menu-item.right {
      transform: translate(57px, 0px);
    }

    #container:focus-within > .menu-item.left {
      transform: translate(-55px, 0px);
    }

    h4 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
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
__decorate([
  query("#container")
], ConductingEquipmentEditor.prototype, "container", 2);
ConductingEquipmentEditor = __decorate([
  customElement("conducting-equipment-editor")
], ConductingEquipmentEditor);
