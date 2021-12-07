import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-button.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../wizard-textfield.js";
import "../filtered-list.js";
import {
  cloneElement,
  getValue,
  identity,
  newWizardEvent,
  selector
} from "../foundation.js";
import {wizards} from "./wizard-library.js";
function updateDataSetAction(element) {
  return (inputs, wizard) => {
    const name = inputs.find((i) => i.label === "name").value;
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const oldName = element.getAttribute("name");
    const dataSetUpdateAction = [];
    if (!(name === oldName && desc === element.getAttribute("desc"))) {
      const newElement = cloneElement(element, {name, desc});
      dataSetUpdateAction.push({
        old: {element},
        new: {element: newElement}
      });
    }
    const controlBlockUpdateActions = name !== oldName ? Array.from(element.parentElement?.querySelectorAll(`ReportControlBock[datSet=${oldName}], GSEControl[datSet=${oldName}],SampledValueControl[datSet=${oldName}] `) ?? []).map((cb) => {
      const newCb = cloneElement(cb, {datSet: name});
      return {old: {element: cb}, new: {element: newCb}};
    }) : [];
    const fCDARemoveActions = Array.from(wizard.shadowRoot.querySelectorAll("filtered-list > mwc-check-list-item:not([selected])")).map((listItem) => element.querySelector(selector("FCDA", listItem.value))).filter((fcda) => fcda).map((fcda) => {
      return {
        old: {
          parent: element,
          element: fcda,
          reference: fcda.nextSibling
        }
      };
    });
    return [
      ...fCDARemoveActions,
      ...dataSetUpdateAction,
      ...controlBlockUpdateActions
    ];
  };
}
export function editDataSetWizard(element) {
  const name = element.getAttribute("name");
  const desc = element.getAttribute("desc");
  return [
    {
      title: get("wizard.title.edit", {tagName: element.tagName}),
      element,
      primary: {
        label: get("edit"),
        icon: "save",
        action: updateDataSetAction(element)
      },
      content: [
        html`<wizard-textfield
          label="name"
          .maybeValue=${name}
          helper="${translate("scl.name")}"
          required
        >
        </wizard-textfield>`,
        html`<wizard-textfield
          label="desc"
          .maybeValue=${desc}
          helper="${translate("scl.desc")}"
          nullable
          required
        >
        </wizard-textfield>`,
        html`<mwc-button
          icon="add"
          label="${translate("wizard.title.add", {tagName: "FCDA"})}"
          @click=${(e) => {
          const wizard = wizards["FCDA"].create(element);
          if (wizard) {
            e.target?.dispatchEvent(newWizardEvent(wizard));
            e.target?.dispatchEvent(newWizardEvent());
          }
        }}
        ></mwc-button>`,
        html`<filtered-list multi
          >${Array.from(element.querySelectorAll("FCDA")).map((fcda) => html`<mwc-check-list-item selected value="${identity(fcda)}"
                >${identity(fcda).split(">")[4]}</mwc-check-list-item
              >`)}</filtered-list
        >`
      ]
    }
  ];
}
