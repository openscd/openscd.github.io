import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import {guessVoltageLevel} from "../editors/substation/guess-wizard.js";
import {
  createElement,
  getReference,
  getValue,
  newWizardEvent
} from "../foundation.js";
function render(name, desc, guessable) {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${name}
      helper="${translate("substation.wizard.nameHelper")}"
      required
      validationMessage="${translate("textfield.required")}"
      dialogInitialFocus
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${desc}
      nullable
      helper="${translate("substation.wizard.descHelper")}"
    ></wizard-textfield>`,
    guessable ? html`<mwc-formfield label="${translate("guess.wizard.primary")}">
          <mwc-checkbox></mwc-checkbox>
        </mwc-formfield>` : html``
  ];
}
function createAction(parent) {
  return (inputs, wizard) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const guess = wizard.shadowRoot?.querySelector("mwc-checkbox")?.checked;
    parent.ownerDocument.createElement("Substation");
    const element = createElement(parent.ownerDocument, "Substation", {
      name,
      desc
    });
    const action = {
      new: {
        parent,
        element,
        reference: getReference(parent, "Substation")
      }
    };
    if (guess)
      wizard.dispatchEvent(newWizardEvent(guessVoltageLevel(parent.ownerDocument)));
    return [action];
  };
}
export function substationCreateWizard(parent) {
  return [
    {
      title: get("substation.wizard.title.add"),
      element: void 0,
      primary: {
        icon: "add",
        label: get("add"),
        action: createAction(parent)
      },
      content: render("", "", true)
    }
  ];
}
function updateNamingAction(element) {
  return (inputs) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    if (name === element.getAttribute("name") && desc === element.getAttribute("desc"))
      return [];
    const newElement = element.cloneNode(false);
    newElement.setAttribute("name", name);
    if (desc === null)
      newElement.removeAttribute("desc");
    else
      newElement.setAttribute("desc", desc);
    return [{old: {element}, new: {element: newElement}}];
  };
}
export function substationEditWizard(element) {
  return [
    {
      title: get("substation.wizard.title.edit"),
      element,
      primary: {
        icon: "edit",
        label: get("save"),
        action: updateNamingAction(element)
      },
      content: render(element.getAttribute("name") ?? "", element.getAttribute("desc"), false)
    }
  ];
}
