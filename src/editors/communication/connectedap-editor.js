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
  property
} from "../../../_snowpack/pkg/lit-element.js";
import {ifDefined} from "../../../_snowpack/pkg/lit-html/directives/if-defined.js";
import {translate, get} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-checkbox.js";
import "../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../../_snowpack/pkg/@material/mwc-formfield.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../action-icon.js";
import "../../wizard-textfield.js";
import "../../filtered-list.js";
import {
  newWizardEvent,
  newActionEvent,
  compareNames,
  getValue,
  createElement
} from "../../foundation.js";
import {selectors} from "./foundation.js";
import {
  getTypes,
  typePattern,
  typeNullable,
  typeMaxLength
} from "./p-types.js";
function compareListItemConnection(a, b) {
  if (a.connected !== b.connected)
    return b.connected ? -1 : 1;
  return 0;
}
function isEqualAddress(oldAddr, newAdddr) {
  return Array.from(oldAddr.querySelectorAll(selectors.Address + " > P")).filter((pType) => !newAdddr.querySelector(`Address > P[type="${pType.getAttribute("type")}"]`)?.isEqualNode(pType)).length === 0;
}
function createAddressElement(inputs, parent, instType) {
  const element = createElement(parent.ownerDocument, "Address", {});
  inputs.filter((input) => getValue(input) !== null).forEach((validInput) => {
    const type = validInput.label;
    const child = createElement(parent.ownerDocument, "P", {type});
    if (instType)
      child.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:type", "tP_" + type);
    child.textContent = getValue(validInput);
    element.appendChild(child);
  });
  return element;
}
function createConnectedApAction(parent) {
  return (inputs, wizard, list) => {
    if (!list)
      return [];
    const apValue = list.selected.map((item) => JSON.parse(item.value));
    const actions = apValue.map((value) => ({
      new: {
        parent,
        element: createElement(parent.ownerDocument, "ConnectedAP", {
          iedName: value.iedName,
          apName: value.apName
        })
      }
    }));
    return actions;
  };
}
function renderWizardPage(element) {
  const doc = element.ownerDocument;
  const accPoints = Array.from(doc.querySelectorAll(":root > IED")).sort(compareNames).flatMap((ied) => Array.from(ied.querySelectorAll(":root > IED > AccessPoint"))).map((accP) => {
    return {
      iedName: accP.parentElement.getAttribute("name"),
      apName: accP.getAttribute("name")
    };
  });
  const accPointDescription = accPoints.map((value) => {
    return {
      value,
      connected: doc?.querySelector(`:root > Communication > SubNetwork > ConnectedAP[iedName="${value.iedName}"][apName="${value.apName}"]`) !== null
    };
  }).sort(compareListItemConnection);
  if (accPointDescription.length)
    return html` <filtered-list id="apList" multi
      >${accPointDescription.map((item) => html`<mwc-check-list-item
          value="${JSON.stringify(item.value)}"
          twoline
          ?disabled=${item.connected}
          ><span>${item.value.apName}</span
          ><span slot="secondary"
            >${item.value.iedName}</span
          ></mwc-check-list-item
        >`)}
    </filtered-list>`;
  return html`<mwc-list-item disabled graphic="icon">
    <span>${translate("lnode.wizard.placeholder")}</span>
    <mwc-icon slot="graphic">info</mwc-icon>
  </mwc-list-item>`;
}
export function createConnectedApWizard(element) {
  return [
    {
      title: get("connectedap.wizard.title.connect"),
      primary: {
        icon: "save",
        label: get("save"),
        action: createConnectedApAction(element)
      },
      content: [renderWizardPage(element)]
    }
  ];
}
export function editConnectedApAction(parent) {
  return (inputs, wizard) => {
    const instType = wizard.shadowRoot?.querySelector("#instType")?.checked ?? false;
    const newAddress = createAddressElement(inputs, parent, instType);
    const complexAction = {
      actions: [],
      title: get("connectedap.action.addaddress", {
        iedName: parent.getAttribute("iedName") ?? "",
        apName: parent.getAttribute("apName") ?? ""
      })
    };
    const oldAddress = parent.querySelector(selectors.Address);
    if (oldAddress !== null && !isEqualAddress(oldAddress, newAddress)) {
      complexAction.actions.push({
        old: {
          parent,
          element: oldAddress,
          reference: oldAddress.nextSibling
        }
      });
      complexAction.actions.push({
        new: {
          parent,
          element: newAddress,
          reference: oldAddress.nextSibling
        }
      });
    } else if (oldAddress === null)
      complexAction.actions.push({
        new: {
          parent,
          element: newAddress
        }
      });
    return [complexAction];
  };
}
function editConnectedApWizard(element) {
  return [
    {
      title: get("connectedap.wizard.title.edit"),
      element,
      primary: {
        icon: "save",
        label: get("save"),
        action: editConnectedApAction(element)
      },
      content: [
        html`<mwc-formfield
            label="${translate("connectedap.wizard.addschemainsttype")}"
          >
            <mwc-checkbox
              id="instType"
              ?checked="${Array.from(element.querySelectorAll(selectors.Address + " > P")).filter((pType) => pType.getAttribute("xsi:type")).length > 0}"
            ></mwc-checkbox> </mwc-formfield
          >${getTypes(element).map((ptype) => html`<wizard-textfield
                label="${ptype}"
                pattern="${ifDefined(typePattern[ptype])}"
                ?nullable=${typeNullable[ptype]}
                .maybeValue=${element.querySelector(`:root > Communication > SubNetwork > ConnectedAP > Address > P[type="${ptype}"]`)?.innerHTML ?? null}
                maxLength="${ifDefined(typeMaxLength[ptype])}"
              ></wizard-textfield>`)}`
      ]
    }
  ];
}
export let ConnectedAPEditor = class extends LitElement {
  get apName() {
    return this.element.getAttribute("apName") ?? "UNDEFINED";
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(editConnectedApWizard(this.element)));
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
  render() {
    return html`
      <action-icon label="${this.apName}" icon="settings_input_hdmi"
        ><mwc-fab
          slot="action"
          mini
          icon="edit"
          @click="${() => this.openEditWizard()}"
        ></mwc-fab>
        <mwc-fab
          slot="action"
          mini
          icon="delete"
          @click="${() => this.remove()}}"
        ></mwc-fab
      ></action-icon>
    `;
  }
};
__decorate([
  property({attribute: false})
], ConnectedAPEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], ConnectedAPEditor.prototype, "apName", 1);
ConnectedAPEditor = __decorate([
  customElement("connectedap-editor")
], ConnectedAPEditor);
