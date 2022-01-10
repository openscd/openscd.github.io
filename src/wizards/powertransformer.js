import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import {
  isPublic
} from "../foundation.js";
import {updateNamingAction} from "./foundation/actions.js";
export function renderPowerTransformerWizard(name, desc, reservedNames) {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${name}
      helper="${translate("powertransformer.wizard.nameHelper")}"
      required
      validationMessage="${translate("textfield.required")}"
      dialogInitialFocus
      .reservedValues=${reservedNames}
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${desc}
      nullable
      helper="${translate("powertransformer.wizard.descHelper")}"
    ></wizard-textfield>`
  ];
}
export function reservedNamesPowerTransformer(currentElement) {
  return Array.from(currentElement.parentNode.querySelectorAll("PowerTransformer")).filter(isPublic).map((cNode) => cNode.getAttribute("name") ?? "").filter((name) => name !== currentElement.getAttribute("name"));
}
export function editPowerTransformerWizard(element) {
  return [
    {
      title: get("powertransformer.wizard.title.edit"),
      element,
      primary: {
        icon: "edit",
        label: get("save"),
        action: updateNamingAction(element)
      },
      content: renderPowerTransformerWizard(element.getAttribute("name"), element.getAttribute("desc"), reservedNamesPowerTransformer(element))
    }
  ];
}
