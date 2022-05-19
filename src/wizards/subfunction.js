import {get} from "../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  getValue
} from "../foundation.js";
import {contentFunctionWizard} from "./function.js";
function createSubFunctionAction(parent) {
  return (inputs) => {
    const subFunctionAttrs = {};
    const subFunctionKeys = ["name", "desc", "type"];
    subFunctionKeys.forEach((key) => {
      subFunctionAttrs[key] = getValue(inputs.find((i) => i.label === key));
    });
    const subFunction = createElement(parent.ownerDocument, "SubFunction", subFunctionAttrs);
    return [{new: {parent, element: subFunction}}];
  };
}
export function createSubFunctionWizard(parent) {
  const name = "";
  const desc = null;
  const type = null;
  const reservedNames = Array.from(parent.querySelectorAll("SubFunction")).map((fUnction) => fUnction.getAttribute("name"));
  return [
    {
      title: get("wizard.title.add", {tagName: "SubFunction"}),
      primary: {
        icon: "save",
        label: get("save"),
        action: createSubFunctionAction(parent)
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
