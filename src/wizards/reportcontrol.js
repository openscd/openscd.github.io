import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-button.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../wizard-checkbox.js";
import "../wizard-textfield.js";
import "../wizard-select.js";
import "../filtered-list.js";
import {
  cloneElement,
  createElement,
  getReference,
  getValue,
  identity,
  isPublic,
  newSubWizardEvent,
  newWizardEvent,
  newActionEvent,
  selector
} from "../foundation.js";
import {maxLength, patterns} from "./foundation/limits.js";
import {editTrgOpsWizard} from "./trgops.js";
import {editOptFieldsWizard} from "./optfields.js";
import {editDataSetWizard} from "./dataset.js";
export function removeReportControlAction(element) {
  if (!element.parentElement)
    return [];
  const dataSet = element.parentElement.querySelector(`DataSet[name="${element.getAttribute("datSet")}"]`);
  const isDataSetUsedByThisControlBlockOnly = Array.from(element.parentElement.querySelectorAll("ReportControl, GSEControl, SampledValueControl")).filter((controlblock) => controlblock.getAttribute("datSet") === dataSet?.getAttribute("name")).length <= 1;
  const actions = [];
  actions.push({
    old: {
      parent: element.parentElement,
      element,
      reference: element.nextSibling
    }
  });
  if (dataSet && isDataSetUsedByThisControlBlockOnly)
    actions.push({
      old: {
        parent: element.parentElement,
        element: dataSet,
        reference: element.nextSibling
      }
    });
  return actions;
}
function getRptEnabledAction(olRptEnabled, max, reportCb) {
  if (olRptEnabled === null) {
    const element = createElement(reportCb.ownerDocument, "RptEnabled", {
      max
    });
    return {
      new: {
        parent: reportCb,
        element,
        reference: getReference(reportCb, "RptEnabled")
      }
    };
  }
  const newRptEnabled = cloneElement(olRptEnabled, {max});
  return {
    old: {element: olRptEnabled},
    new: {element: newRptEnabled}
  };
}
function updateReportControlAction(element) {
  return (inputs) => {
    const attributes = {};
    const attributeKeys = [
      "name",
      "desc",
      "buffered",
      "rptID",
      "indexed",
      "bufTime",
      "intgPd"
    ];
    attributeKeys.forEach((key) => {
      attributes[key] = getValue(inputs.find((i) => i.label === key));
    });
    let reportControlAction = null;
    if (attributeKeys.some((key) => attributes[key] !== element.getAttribute(key))) {
      const newElement = cloneElement(element, attributes);
      reportControlAction = {
        old: {element},
        new: {element: newElement}
      };
    }
    const max = getValue(inputs.find((i) => i.label === "max Clients"));
    let rptEnabledAction = null;
    if (max !== (element.querySelector("RptEnabled")?.getAttribute("max") ?? null))
      rptEnabledAction = getRptEnabledAction(element.querySelector("RptEnabled"), max, element);
    const actions = [];
    if (reportControlAction)
      actions.push(reportControlAction);
    if (rptEnabledAction)
      actions.push(rptEnabledAction);
    return actions;
  };
}
function renderReportControlWizardInputs(options) {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${options.name}
      helper="${translate("scl.name")}"
      required
      validationMessage="${translate("textfield.required")}"
      pattern="${patterns.asciName}"
      maxLength="${maxLength.cbName}"
      dialogInitialFocus
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${options.desc}
      nullable
      helper="${translate("scl.desc")}"
    ></wizard-textfield>`,
    html`<wizard-checkbox
      label="buffered"
      .maybeValue=${options.buffered}
      disabled
    ></wizard-checkbox>`,
    html`<wizard-textfield
      label="rptID"
      .maybeValue=${options.rptID}
      helper="${translate("scl.id")}"
      required
      validationMessage="${translate("textfield.nonempty")}"
    ></wizard-textfield>`,
    html`<wizard-checkbox
      label="indexed"
      .maybeValue=${options.indexed}
      nullable
    ></wizard-checkbox>`,
    html`<wizard-textfield
      label="max Clients"
      .maybeValue=${options.max}
      helper="${translate("scl.maxReport")}"
      nullable
      type="number"
      suffix="ms"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="bufTime"
      .maybeValue=${options.bufTime}
      helper="${translate("scl.bufTime")}"
      nullable
      required
      type="number"
      min="0"
      suffix="ms"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="intgPd"
      .maybeValue=${options.intgPd}
      helper="${translate("scl.intgPd")}"
      nullable
      required
      type="number"
      min="0"
      suffix="ms"
    ></wizard-textfield>`
  ];
}
export function editReportControlWizard(element) {
  const name = element.getAttribute("name");
  const desc = element.getAttribute("desc");
  const buffered = element.getAttribute("buffered");
  const rptID = element.getAttribute("rptID");
  const indexed = element.getAttribute("indexed");
  const max = element.querySelector("RptEnabled")?.getAttribute("max") ?? null;
  const bufTime = element.getAttribute("bufTime");
  const intgPd = element.getAttribute("intgPd");
  const trgOps = element.querySelector("TrgOps");
  const optFields = element.querySelector("OptFields");
  const dataSet = element.parentElement?.querySelector(`DataSet[name="${element.getAttribute("datSet")}"]`);
  return [
    {
      title: get("wizard.title.edit", {tagName: element.tagName}),
      element,
      primary: {
        icon: "save",
        label: get("save"),
        action: updateReportControlAction(element)
      },
      content: [
        ...renderReportControlWizardInputs({
          name,
          desc,
          buffered,
          rptID,
          indexed,
          max,
          bufTime,
          intgPd
        }),
        dataSet ? html`<mwc-button
              label=${translate("scl.DataSet")}
              icon="edit"
              id="editdataset"
              @click=${(e) => {
          e.target?.dispatchEvent(newSubWizardEvent(() => editDataSetWizard(dataSet)));
        }}
            ></mwc-button>` : html``,
        trgOps ? html`<mwc-button
              label=${translate("scl.TrgOps")}
              icon="edit"
              id="edittrgops"
              @click=${(e) => {
          e.target?.dispatchEvent(newSubWizardEvent(() => editTrgOpsWizard(trgOps)));
        }}
            ></mwc-button>` : html``,
        optFields ? html`<mwc-button
              label=${translate("scl.OptFields")}
              icon="edit"
              id="editoptfields"
              @click=${(e) => {
          e.target?.dispatchEvent(newSubWizardEvent(() => editOptFieldsWizard(optFields)));
        }}
            ></mwc-button>` : html``,
        html`<mwc-button
          label="${translate("remove")}"
          icon="delete"
          @click=${(e) => {
          const deleteActions = removeReportControlAction(element);
          deleteActions.forEach((deleteAction) => e.target?.dispatchEvent(newActionEvent(deleteAction)));
          e.target?.dispatchEvent(newWizardEvent());
        }}
        ></mwc-button>`
      ]
    }
  ];
}
export function selectReportControlWizard(element) {
  const reportControls = Array.from(element.querySelectorAll("ReportControl")).filter(isPublic);
  return [
    {
      title: get("wizard.title.select", {tagName: "ReportControl"}),
      content: [
        html`<filtered-list
          @selected=${(e) => {
          const identity2 = e.target.selected.value;
          const reportControl = element.querySelector(selector("ReportControl", identity2));
          if (!reportControl)
            return;
          e.target?.dispatchEvent(newSubWizardEvent(() => editReportControlWizard(reportControl)));
        }}
          >${reportControls.map((reportControl) => html`<mwc-list-item twoline value="${identity(reportControl)}"
                ><span>${reportControl.getAttribute("name")}</span
                ><span slot="secondary"
                  >${identity(reportControl)}</span
                ></mwc-list-item
              >`)}</filtered-list
        >`
      ]
    }
  ];
}
