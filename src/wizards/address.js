import {html} from "../../_snowpack/pkg/lit-html.js";
import {ifDefined} from "../../_snowpack/pkg/lit-html/directives/if-defined.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-checkbox.js";
import "../../_snowpack/pkg/@material/mwc-formfield.js";
import "../wizard-textfield.js";
import {
  createElement,
  getValue
} from "../foundation.js";
import {
  pTypesGSESMV,
  typeNullable,
  typePattern
} from "./foundation/p-types.js";
export function renderGseSmvAddress(parent) {
  const hasInstType = Array.from(parent.querySelectorAll("Address > P")).some((pType) => pType.getAttribute("xsi:type"));
  return [
    html`<mwc-formfield
      label="${translate("connectedap.wizard.addschemainsttype")}"
    >
      <mwc-checkbox id="instType" ?checked="${hasInstType}"></mwc-checkbox>
    </mwc-formfield>`,
    html`${pTypesGSESMV.map((ptype) => html`<wizard-textfield
          label="${ptype}"
          .maybeValue=${parent.querySelector(`Address > P[type="${ptype}"]`)?.innerHTML.trim() ?? null}
          ?nullable=${typeNullable[ptype]}
          pattern="${ifDefined(typePattern[ptype])}"
          required
        ></wizard-textfield>`)}`
  ];
}
function isEqualAddress(oldAddr, newAdddr) {
  return Array.from(oldAddr.querySelectorAll("P")).filter((pType) => !newAdddr.querySelector(`Address > P[type="${pType.getAttribute("type")}"]`)?.isEqualNode(pType)).length === 0;
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
export function updateAddress(parent, inputs, instType) {
  const actions = [];
  const newAddress = createAddressElement(inputs, parent, instType);
  const oldAddress = parent.querySelector("Address");
  if (oldAddress !== null && !isEqualAddress(oldAddress, newAddress)) {
    actions.push({
      old: {
        parent,
        element: oldAddress,
        reference: oldAddress.nextSibling
      }
    });
    actions.push({
      new: {
        parent,
        element: newAddress,
        reference: oldAddress.nextSibling
      }
    });
  } else if (oldAddress === null)
    actions.push({
      new: {
        parent,
        element: newAddress
      }
    });
  return actions;
}
