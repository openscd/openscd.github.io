import {html} from "../../_snowpack/pkg/lit-element.js";
import {get} from "../../_snowpack/pkg/lit-translate.js";
import {getCustomField} from "../editors/ied/foundation/foundation.js";
import {
  getValue
} from "../foundation.js";
export function updateValue(element) {
  return (inputs) => {
    const newValue = getValue(inputs.find((i) => i.value));
    const name = element.getAttribute("name");
    const oldVal = element.querySelector("Val");
    const complexAction = {
      actions: [],
      title: get("dai.action.updatedai", {daiName: name})
    };
    const newVal = oldVal.cloneNode(false);
    newVal.textContent = newValue;
    complexAction.actions.push({old: {element: oldVal}, new: {element: newVal}});
    return [complexAction];
  };
}
export function renderDAIWizard(element, instanceElement) {
  const bType = element.getAttribute("bType");
  return [
    html`${getCustomField()[bType].render(element, instanceElement)}`
  ];
}
export function editDAIWizard(element, instanceElement) {
  return [
    {
      title: get("dai.wizard.title.edit", {
        daiName: instanceElement?.getAttribute("name") ?? ""
      }),
      element: instanceElement,
      primary: {
        icon: "edit",
        label: get("save"),
        action: updateValue(instanceElement)
      },
      content: renderDAIWizard(element, instanceElement)
    }
  ];
}
