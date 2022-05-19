import {get} from "../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  getValue
} from "../foundation.js";
import {contentFunctionWizard} from "./function.js";
function createEqSubFunctionAction(parent) {
  return (inputs) => {
    const eqSubFunctionAttrs = {};
    const eqSubFunctionKeys = ["name", "desc", "type"];
    eqSubFunctionKeys.forEach((key) => {
      eqSubFunctionAttrs[key] = getValue(inputs.find((i) => i.label === key));
    });
    const eqSubFunction = createElement(parent.ownerDocument, "EqSubFunction", eqSubFunctionAttrs);
    return [{new: {parent, element: eqSubFunction}}];
  };
}
export function createEqSubFunctionWizard(parent) {
  const name = "";
  const desc = null;
  const type = null;
  const reservedNames = Array.from(parent.querySelectorAll("EqSubFunction")).map((eqSubFunction) => eqSubFunction.getAttribute("name"));
  return [
    {
      title: get("wizard.title.add", {tagName: "EqSubFunction"}),
      primary: {
        icon: "save",
        label: get("save"),
        action: createEqSubFunctionAction(parent)
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
