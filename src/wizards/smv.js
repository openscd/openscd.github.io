import {get} from "../../_snowpack/pkg/lit-translate.js";
import {
  identity
} from "../foundation.js";
import {renderGseSmvAddress, updateAddress} from "./address.js";
export function updateSmvAction(element) {
  return (inputs, wizard) => {
    const complexAction = {
      actions: [],
      title: get("smv.action.addaddress", {
        identity: identity(element)
      })
    };
    const instType = wizard.shadowRoot?.querySelector("#instType")?.checked;
    const addressActions = updateAddress(element, inputs, instType);
    if (!addressActions.length)
      return [];
    addressActions.forEach((action) => {
      complexAction.actions.push(action);
    });
    return [complexAction];
  };
}
export function editSMvWizard(element) {
  return [
    {
      title: get("wizard.title.edit", {tagName: element.tagName}),
      element,
      primary: {
        label: get("save"),
        icon: "edit",
        action: updateSmvAction(element)
      },
      content: [...renderGseSmvAddress(element)]
    }
  ];
}
