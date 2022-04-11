import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import "../wizard-textfield.js";
import {isPublic} from "../foundation.js";
import {patterns} from "./foundation/limits.js";
import {updateNamingAttributeWithReferencesAction} from "./foundation/actions.js";
const iedNamePattern = "[A-Za-z][0-9A-Za-z_]{0,2}|[A-Za-z][0-9A-Za-z_]{4,63}|[A-MO-Za-z][0-9A-Za-z_]{3}|N[0-9A-Za-np-z_][0-9A-Za-z_]{2}|No[0-9A-Za-mo-z_][0-9A-Za-z_]|Non[0-9A-Za-df-z_]";
export function renderIEDWizard(name, desc, reservedNames) {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${name}
      helper="${translate("ied.wizard.nameHelper")}"
      required
      validationMessage="${translate("textfield.required")}"
      dialogInitialFocus
      .reservedValues=${reservedNames}
      pattern="${iedNamePattern}"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${desc}
      nullable
      helper="${translate("ied.wizard.descHelper")}"
      pattern="${patterns.normalizedString}"
    ></wizard-textfield>`
  ];
}
export function reservedNamesIED(currentElement) {
  return Array.from(currentElement.parentNode.querySelectorAll("IED")).filter(isPublic).map((ied) => ied.getAttribute("name") ?? "").filter((name) => name !== currentElement.getAttribute("name"));
}
export function editIEDWizard(element) {
  return [
    {
      title: get("ied.wizard.title.edit"),
      element,
      primary: {
        icon: "edit",
        label: get("save"),
        action: updateNamingAttributeWithReferencesAction(element, "ied.action.updateied")
      },
      content: renderIEDWizard(element.getAttribute("name"), element.getAttribute("desc"), reservedNamesIED(element))
    }
  ];
}
