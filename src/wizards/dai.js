import {html} from "../../_snowpack/pkg/lit-element.js";
import {nothing} from "../../_snowpack/pkg/lit-html.js";
import {get} from "../../_snowpack/pkg/lit-translate.js";
import {getCustomField} from "./foundation/dai-field-type.js";
import "../wizard-textfield.js";
import {SCL_NAMESPACE} from "../schemas.js";
export function updateValue(element, instanceElement) {
  return (inputs) => {
    const bType = element.getAttribute("bType");
    const newValue = getCustomField()[bType].value(inputs);
    const name = instanceElement.getAttribute("name");
    const complexAction = {
      actions: [],
      title: get("dai.action.updatedai", {daiName: name})
    };
    const oldVal = instanceElement.querySelector("Val");
    if (oldVal) {
      const newVal = oldVal.cloneNode(false);
      newVal.textContent = newValue;
      complexAction.actions.push({
        old: {element: oldVal},
        new: {element: newVal}
      });
    } else {
      const newVal = instanceElement.ownerDocument.createElementNS(SCL_NAMESPACE, "Val");
      newVal.textContent = newValue;
      complexAction.actions.push({
        new: {parent: instanceElement, element: newVal}
      });
    }
    return [complexAction];
  };
}
export function createValue(parent, element, newElement, instanceElement) {
  return (inputs) => {
    const bType = element.getAttribute("bType");
    const newValue = getCustomField()[bType].value(inputs);
    let valElement = instanceElement.querySelector("Val");
    if (!valElement) {
      valElement = parent.ownerDocument.createElementNS(SCL_NAMESPACE, "Val");
      instanceElement.append(valElement);
    }
    valElement.textContent = newValue;
    const name = instanceElement.getAttribute("name");
    const complexAction = {
      actions: [{new: {parent, element: newElement}}],
      title: get("dai.action.createdai", {daiName: name})
    };
    return [complexAction];
  };
}
export function renderDAIWizard(element, instanceElement) {
  const bType = element.getAttribute("bType");
  const daValue = element.querySelector("Val")?.textContent?.trim() ?? "";
  return [
    html` ${getCustomField()[bType].render(element, instanceElement)}
    ${daValue ? html`<wizard-textfield
          id="daVal"
          label="DA Template Value"
          .maybeValue=${daValue}
          readonly
          disabled
        >
        </wizard-textfield>` : nothing}`
  ];
}
export function createDAIWizard(parent, newElement, element) {
  const instanceElement = newElement.tagName === "DAI" ? newElement : newElement.querySelector("DAI");
  return [
    {
      title: get("dai.wizard.title.create", {
        daiName: instanceElement?.getAttribute("name") ?? ""
      }),
      element: instanceElement,
      primary: {
        icon: "edit",
        label: get("save"),
        action: createValue(parent, element, newElement, instanceElement)
      },
      content: renderDAIWizard(element, instanceElement)
    }
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
        action: updateValue(element, instanceElement)
      },
      content: renderDAIWizard(element, instanceElement)
    }
  ];
}
