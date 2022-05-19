import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  getValue
} from "../foundation.js";
export function contentFunctionWizard(content) {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${content.name}
      helper="${translate("scl.name")}"
      required
      validationMessage="${translate("textfield.required")}"
      .reservedValues=${content.reservedNames}
      dialogInitialFocus
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${content.desc}
      nullable
      helper="${translate("scl.desc")}"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="type"
      .maybeValue=${content.type}
      helper="${translate("scl.type")}"
      nullable
    ></wizard-textfield>`
  ];
}
function createFunctionAction(parent) {
  return (inputs) => {
    const functionAttrs = {};
    const functionKeys = ["name", "desc", "type"];
    functionKeys.forEach((key) => {
      functionAttrs[key] = getValue(inputs.find((i) => i.label === key));
    });
    const fUnction = createElement(parent.ownerDocument, "Function", functionAttrs);
    return [{new: {parent, element: fUnction}}];
  };
}
export function createFunctionWizard(parent) {
  const name = "";
  const desc = null;
  const type = null;
  const reservedNames = Array.from(parent.querySelectorAll("Function")).map((fUnction) => fUnction.getAttribute("name"));
  return [
    {
      title: get("wizard.title.add", {tagName: "Function"}),
      primary: {
        icon: "save",
        label: get("save"),
        action: createFunctionAction(parent)
      },
      content: [
        ...contentFunctionWizard({
          name,
          desc,
          type,
          reservedNames
        })
      ]
    }
  ];
}
