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
} from "../../../_snowpack/pkg/lit-element.js";
import {translate, get} from "../../../_snowpack/pkg/lit-translate.js";
import {
  newWizardEvent,
  newActionEvent,
  compareNames,
  getValue,
  createElement
} from "../../foundation.js";
import {
  getTypes,
  typePattern,
  typeNullable,
  typeMaxLength
} from "./p-types.js";
import {selectors} from "./foundation.js";
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
export let ConnectedAPEditor = class extends LitElement {
  get apName() {
    return this.element.getAttribute("apName") ?? null;
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(ConnectedAPEditor.editWizard(this.element)));
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
  render() {
    return html`
      <div id="container" tabindex="0">
        <mwc-icon class="fancy">settings_input_hdmi</mwc-icon>
        <mwc-fab
          mini
          class="menu-item left"
          icon="edit"
          @click="${() => this.openEditWizard()}"
        ></mwc-fab>
        <mwc-fab
          mini
          class="menu-item right"
          icon="delete"
          @click="${() => this.remove()}}"
        ></mwc-fab>
      </div>
      <h4>${this.apName}</h4>
    `;
  }
  static createAction(parent) {
    return (inputs, wizard) => {
      const apValue = wizard.shadowRoot.querySelector("#apList").selected.map((item) => JSON.parse(item.value));
      const actions = apValue.map((value) => ({
        new: {
          parent,
          element: createElement(parent.ownerDocument, "ConnectedAP", {
            iedName: value.iedName,
            apName: value.apName
          }),
          reference: null
        }
      }));
      return actions;
    };
  }
  static onFilterInput(evt) {
    (evt.target.parentElement?.querySelector("mwc-list")).items.forEach((item) => {
      item.value.toUpperCase().includes(evt.target.value.toUpperCase()) ? item.removeAttribute("style") : item.setAttribute("style", "display:none;");
    });
  }
  static renderWizardPage(element) {
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
      return html`<mwc-textfield
          label="${translate("filter")}"
          iconTrailing="search"
          outlined
          @input=${ConnectedAPEditor.onFilterInput}
        ></mwc-textfield>
        <mwc-list id="apList" multi
          >${accPointDescription.map((item) => html`<mwc-check-list-item
              value="${JSON.stringify(item.value)}"
              twoline
              ?disabled=${item.connected}
              ><span>${item.value.apName}</span
              ><span slot="secondary"
                >${item.value.iedName}</span
              ></mwc-check-list-item
            >`)}
        </mwc-list>`;
    return html`<mwc-list-item disabled graphic="icon">
      <span>${translate("lnode.wizard.placeholder")}</span>
      <mwc-icon slot="graphic">info</mwc-icon>
    </mwc-list-item>`;
  }
  static createConnectedAP(element) {
    return [
      {
        title: get("connectedap.wizard.title.connect"),
        primary: {
          icon: "save",
          label: get("save"),
          action: ConnectedAPEditor.createAction(element)
        },
        content: [ConnectedAPEditor.renderWizardPage(element)]
      }
    ];
  }
  static editAction(parent) {
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
            reference: oldAddress.nextElementSibling
          }
        });
        complexAction.actions.push({
          new: {
            parent,
            element: newAddress,
            reference: oldAddress.nextElementSibling
          }
        });
      } else if (oldAddress === null)
        complexAction.actions.push({
          new: {
            parent,
            element: newAddress,
            reference: parent.firstElementChild
          }
        });
      return [complexAction];
    };
  }
  static editWizard(element) {
    return [
      {
        title: get("connectedap.wizard.title.edit"),
        primary: {
          icon: "save",
          label: get("save"),
          action: ConnectedAPEditor.editAction(element)
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
                  pattern="${typePattern[ptype]}"
                  nullable=${typeNullable[ptype]}
                  .maybeValue=${element.querySelector(`:root > Communication > SubNetwork > ConnectedAP > Address > P[type="${ptype}"]`)?.innerHTML ?? null}
                  maxLength="${typeMaxLength[ptype] ?? null}"
                ></wizard-textfield>`)}`
        ]
      }
    ];
  }
};
ConnectedAPEditor.styles = css`
    #container {
      color: var(--mdc-theme-on-surface);
      width: 64px;
      height: 64px;
      margin: auto;
      position: relative;
      transition: all 200ms linear;
    }

    #container:focus {
      outline: none;
    }

    .fancy {
      color: var(--mdc-theme-on-surface);
      --mdc-icon-size: 64px;
      transition: transform 150ms linear, box-shadow 200ms linear;
      outline-color: var(--mdc-theme-primary);
      outline-style: solid;
      outline-width: 0px;
    }

    #container:focus > .fancy {
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
    }

    #container:hover > .fancy {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    #container:focus-within > .fancy {
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
      top: 8px;
      left: 8px;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
    }

    #container:focus-within > .menu-item {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 250ms linear;
      pointer-events: auto;
      opacity: 1;
    }

    #container:focus-within > .menu-item.up {
      transform: translate(0px, -52px);
    }

    #container:focus-within > .menu-item.down {
      transform: translate(0px, 52px);
    }

    #container:focus-within > .menu-item.right {
      transform: translate(52px, 0px);
    }

    #container:focus-within > .menu-item.left {
      transform: translate(-52px, 0px);
    }

    h4 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      opacity: 1;
      transition: opacity 200ms linear;
      text-align: center;
    }

    :host(.moving) #container,
    :host(.moving) h4 {
      opacity: 0.3;
    }
  `;
__decorate([
  property()
], ConnectedAPEditor.prototype, "element", 2);
__decorate([
  property()
], ConnectedAPEditor.prototype, "apName", 1);
ConnectedAPEditor = __decorate([
  customElement("connectedap-editor")
], ConnectedAPEditor);
