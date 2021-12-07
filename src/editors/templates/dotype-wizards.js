import {html} from "../../../_snowpack/pkg/lit-html.js";
import {get, translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-button.js";
import "../../../_snowpack/pkg/@material/mwc-list.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../../_snowpack/pkg/@material/mwc-select.js";
import "../../wizard-textfield.js";
import {
  cloneElement,
  createElement,
  getValue,
  identity,
  isPublic,
  newActionEvent,
  newWizardEvent,
  selector
} from "../../foundation.js";
import {createDaWizard, editDAWizard} from "../../wizards/da.js";
import {patterns} from "../../wizards/foundation/limits.js";
import {
  addReferencedDataTypes,
  allDataTypeSelector,
  unifyCreateActionArray
} from "./foundation.js";
function updateSDoAction(element) {
  return (inputs) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const type = getValue(inputs.find((i) => i.label === "type"));
    const actions = [];
    if (name === element.getAttribute("name") && desc === element.getAttribute("desc") && type === element.getAttribute("type")) {
      return [];
    }
    const newElement = cloneElement(element, {name, desc, type});
    actions.push({old: {element}, new: {element: newElement}});
    return actions;
  };
}
function createSDoAction(parent) {
  return (inputs) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const type = getValue(inputs.find((i) => i.label === "type"));
    const actions = [];
    const element = createElement(parent.ownerDocument, "SDO", {
      name,
      desc,
      type
    });
    actions.push({
      new: {
        parent,
        element
      }
    });
    return actions;
  };
}
function sDOWizard(options) {
  const doc = options.doc ? options.doc : options.parent.ownerDocument;
  const sdo = Array.from(doc.querySelectorAll(selector("SDO", options.identity ?? NaN))).find(isPublic) ?? null;
  const [title, action, type, deleteButton, name, desc] = sdo ? [
    get("sdo.wizard.title.edit"),
    updateSDoAction(sdo),
    sdo.getAttribute("type"),
    html`<mwc-button
          icon="delete"
          trailingIcon
          label="${translate("remove")}"
          @click=${(e) => {
      e.target.dispatchEvent(newWizardEvent());
      e.target.dispatchEvent(newActionEvent({
        old: {
          parent: sdo.parentElement,
          element: sdo,
          reference: sdo.nextSibling
        }
      }));
    }}
          fullwidth
        ></mwc-button> `,
    sdo.getAttribute("name"),
    sdo.getAttribute("desc")
  ] : [
    get("sdo.wizard.title.add"),
    createSDoAction(options.parent),
    null,
    html``,
    "",
    null
  ];
  const types = Array.from(doc.querySelectorAll("DOType")).filter(isPublic).filter((type2) => type2.getAttribute("id"));
  return [
    {
      title,
      element: sdo ?? void 0,
      primary: {icon: "", label: get("save"), action},
      content: [
        deleteButton,
        html`<wizard-textfield
          label="name"
          .maybeValue=${name}
          helper="${translate("scl.name")}"
          required
          pattern="${patterns.tRestrName1stL}"
          dialogInitialFocus
        >
          ></wizard-textfield
        >`,
        html`<wizard-textfield
          label="desc"
          helper="${translate("scl.desc")}"
          .maybeValue=${desc}
          nullable
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<mwc-select
          fixedMenuPosition
          label="type"
          required
          helper="${translate("scl.type")}"
          >${types.map((dataType) => html`<mwc-list-item
                value=${dataType.id}
                ?selected=${dataType.id === type}
                >${dataType.id}</mwc-list-item
              >`)}</mwc-select
        >`
      ]
    }
  ];
}
function addPredefinedDOType(parent, templates) {
  return (inputs) => {
    const id = getValue(inputs.find((i) => i.label === "id"));
    if (!id)
      return [];
    const existId = Array.from(templates.querySelectorAll(allDataTypeSelector)).some((type) => type.getAttribute("id") === id);
    if (existId)
      return [];
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const cdc = getValue(inputs.find((i) => i.label === "cdc"));
    const values = inputs.find((i) => i.label === "values");
    const selectedElement = values.selected ? templates.querySelector(`DOType[id="${values.selected.value}"]`) : null;
    const element = values.selected ? selectedElement.cloneNode(true) : parent.ownerDocument.createElement("DOType");
    element.setAttribute("id", id);
    element.setAttribute("cdc", cdc);
    if (desc)
      element.setAttribute("desc", desc);
    const actions = [];
    if (selectedElement)
      addReferencedDataTypes(selectedElement, parent).forEach((action) => actions.push(action));
    actions.push({
      new: {
        parent,
        element
      }
    });
    return unifyCreateActionArray(actions);
  };
}
function onSelectTemplateDOType(e, templates) {
  const cdcUI = e.target.parentElement.querySelector('wizard-textfield[label="cdc"]');
  const doTypeId = e.target.value;
  const cdc = templates.querySelector(`DOType[id="${doTypeId}"]`)?.getAttribute("cdc") ?? null;
  if (cdc)
    cdcUI.value = cdc;
  cdcUI.disabled = true;
}
export function createDOTypeWizard(parent, templates) {
  return [
    {
      title: get("dotype.wizard.title.add"),
      primary: {
        icon: "add",
        label: get("add"),
        action: addPredefinedDOType(parent, templates)
      },
      content: [
        html`<mwc-select
          fixedMenuPosition
          outlined
          icon="playlist_add_check"
          label="values"
          helper="${translate("dotype.wizard.enums")}"
          @selected=${(e) => onSelectTemplateDOType(e, templates)}
        >
          ${Array.from(templates.querySelectorAll("DOType")).map((datype) => html`<mwc-list-item
                graphic="icon"
                hasMeta
                value="${datype.getAttribute("id") ?? ""}"
                ><span
                  >${datype.getAttribute("id")?.replace("OpenSCD_", "")}</span
                >
                <span slot="meta"
                  >${datype.querySelectorAll("SDO,DA").length}</span
                >
              </mwc-list-item>`)}
        </mwc-select>`,
        html`<wizard-textfield
          label="id"
          helper="${translate("scl.id")}"
          .maybeValue=${""}
          required
          maxlength="127"
          minlength="1"
          pattern="${patterns.nmToken}"
          dialogInitialFocus
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="desc"
          helper="${translate("scl.desc")}"
          .maybeValue=${null}
          nullable
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="cdc"
          helper="${translate("scl.cdc")}"
          required
          pattern="${patterns.cdc}"
        ></wizard-textfield>`
      ]
    }
  ];
}
function updateDOTypeAction(element) {
  return (inputs) => {
    const id = getValue(inputs.find((i) => i.label === "id"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const cdc = getValue(inputs.find((i) => i.label === "CDC"));
    if (id === element.getAttribute("id") && desc === element.getAttribute("desc") && cdc == element.getAttribute("cdc"))
      return [];
    const newElement = cloneElement(element, {id, desc, cdc});
    return [{old: {element}, new: {element: newElement}}];
  };
}
export function dOTypeWizard(dOTypeIdentity, doc) {
  const dotype = doc.querySelector(selector("DOType", dOTypeIdentity));
  if (!dotype)
    return void 0;
  return [
    {
      title: get("dotype.wizard.title.edit"),
      element: dotype,
      primary: {
        icon: "",
        label: get("save"),
        action: updateDOTypeAction(dotype)
      },
      content: [
        html`<mwc-button
          icon="delete"
          trailingIcon
          label="${translate("remove")}"
          @click=${(e) => {
          e.target.dispatchEvent(newWizardEvent());
          e.target.dispatchEvent(newActionEvent({
            old: {
              parent: dotype.parentElement,
              element: dotype,
              reference: dotype.nextSibling
            }
          }));
        }}
          fullwidth
        ></mwc-button> `,
        html`<wizard-textfield
          label="id"
          helper="${translate("scl.id")}"
          .maybeValue=${dotype.getAttribute("id")}
          required
          maxlength="127"
          minlength="1"
          pattern="${patterns.nmToken}"
          dialogInitialFocus
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="desc"
          helper="${translate("scl.desc")}"
          .maybeValue=${dotype.getAttribute("desc")}
          nullable
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="CDC"
          helper="${translate("scl.CDC")}"
          .maybeValue=${dotype.getAttribute("cdc")}
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<section>
          <mwc-button
            slot="graphic"
            icon="playlist_add"
            trailingIcon
            label="${translate("scl.DO")}"
            @click=${(e) => {
          const wizard = sDOWizard({
            parent: dotype
          });
          if (wizard)
            e.target.dispatchEvent(newWizardEvent(wizard));
          e.target.dispatchEvent(newWizardEvent());
        }}
          ></mwc-button>
          <mwc-button
            slot="graphic"
            icon="playlist_add"
            trailingIcon
            label="${translate("scl.DA")}"
            @click=${(e) => {
          if (dotype)
            e.target.dispatchEvent(newWizardEvent(createDaWizard(dotype)));
          e.target.dispatchEvent(newWizardEvent());
        }}
          ></mwc-button>
        </section>`,
        html`
          <mwc-list
            style="margin-top: 0px;"
            @selected=${(e) => {
          const item = e.target.selected;
          const daIdentity = e.target.selected.value;
          const da = doc.querySelector(selector("DA", daIdentity));
          const wizard = item.classList.contains("DA") ? da ? editDAWizard(da) : void 0 : sDOWizard({
            identity: item.value,
            doc
          });
          if (wizard)
            e.target.dispatchEvent(newWizardEvent(wizard));
          e.target.dispatchEvent(newWizardEvent());
        }}
          >
            ${Array.from(dotype.querySelectorAll("SDO, DA")).map((daorsdo) => html`<mwc-list-item
                  twoline
                  tabindex="0"
                  class="${daorsdo.tagName === "DA" ? "DA" : "SDO"}"
                  value="${identity(daorsdo)}"
                  ><span>${daorsdo.getAttribute("name")}</span
                  ><span slot="secondary"
                    >${daorsdo.tagName === "SDO" || daorsdo.getAttribute("bType") === "Enum" || daorsdo.getAttribute("bType") === "Struct" ? "#" + daorsdo.getAttribute("type") : daorsdo.getAttribute("bType")}</span
                  ></mwc-list-item
                >`)}
          </mwc-list>
        `
      ]
    }
  ];
}
