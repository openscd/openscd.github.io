import {html} from "../../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  getReference,
  getValue,
  identity,
  isPublic,
  newActionEvent,
  newWizardEvent,
  patterns,
  selector
} from "../../foundation.js";
import {
  updateIDNamingAction
} from "./foundation.js";
function nextOrd(parent) {
  const maxOrd = Math.max(...Array.from(parent.children).map((child) => parseInt(child.getAttribute("ord") ?? "-2", 10)));
  return isFinite(maxOrd) ? (maxOrd + 1).toString(10) : "0";
}
function createEnumValAction(parent) {
  return (inputs) => {
    const value = getValue(inputs.find((i) => i.label === "value"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const ord = getValue(inputs.find((i) => i.label === "ord")) || nextOrd(parent);
    const element = createElement(parent.ownerDocument, "EnumVal", {
      ord,
      desc
    });
    element.textContent = value;
    const action = {
      new: {
        parent,
        element,
        reference: getReference(parent, "EnumVal")
      }
    };
    return [action];
  };
}
function updateEnumValAction(element) {
  return (inputs) => {
    const value = getValue(inputs.find((i) => i.label === "value")) ?? "";
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const ord = getValue(inputs.find((i) => i.label === "ord")) || element.getAttribute("ord") || nextOrd(element.parentElement);
    if (value === element.textContent && desc === element.getAttribute("desc") && ord === element.getAttribute("ord"))
      return [];
    const newElement = element.cloneNode(false);
    if (desc === null)
      newElement.removeAttribute("desc");
    else
      newElement.setAttribute("desc", desc);
    newElement.setAttribute("ord", ord);
    newElement.textContent = value;
    return [{old: {element}, new: {element: newElement}}];
  };
}
function eNumValWizard(options) {
  const doc = options.doc ? options.doc : options.parent.ownerDocument;
  const enumval = Array.from(doc.querySelectorAll(selector("EnumVal", options.identity ?? NaN))).find(isPublic) ?? null;
  const [title, action, ord, desc, value, deleteButton] = enumval ? [
    get("enum-val.wizard.title.edit"),
    updateEnumValAction(enumval),
    enumval.getAttribute("ord"),
    enumval.getAttribute("desc"),
    enumval.textContent,
    html`<mwc-button
          icon="delete"
          trailingIcon
          label=${translate("delete")}
          @click=${(e) => {
      e.target.dispatchEvent(newWizardEvent());
      e.target.dispatchEvent(newActionEvent({
        old: {
          parent: enumval.parentElement,
          element: enumval,
          reference: enumval.nextSibling
        }
      }));
    }}
          fullwidth
        ></mwc-button>`
  ] : [
    get("enum-val.wizard.title.add"),
    createEnumValAction(options.parent),
    nextOrd(options.parent),
    null,
    "",
    html``
  ];
  return [
    {
      title,
      element: enumval ?? void 0,
      primary: {
        icon: "",
        label: "Save",
        action
      },
      content: [
        deleteButton,
        html`<wizard-textfield
          label="ord"
          helper="${translate("scl.ord")}"
          .maybeValue=${ord}
          required
          type="number"
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="value"
          helper="${translate("scl.value")}"
          .maybeValue=${value}
          pattern="${patterns.normalizedString}"
          dialogInitialFocus
        ></wizard-textfield>`,
        html`<wizard-textfield
          id="evDesc"
          label="desc"
          helper="${translate("scl.desc")}"
          .maybeValue=${desc}
          nullable
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`
      ]
    }
  ];
}
function createAction(parent, templates) {
  return (inputs) => {
    const id = getValue(inputs.find((i) => i.label === "id"));
    if (!id)
      return [];
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const values = inputs.find((i) => i.label === "values");
    const element = values.selected ? templates.querySelector(`EnumType[id="${values.selected.value}"]`).cloneNode(true) : parent.ownerDocument.createElement("EnumType");
    element.setAttribute("id", id);
    if (desc)
      element.setAttribute("desc", desc);
    const action = {
      new: {
        parent,
        element,
        reference: getReference(parent, element.tagName)
      }
    };
    return [action];
  };
}
export function createEnumTypeWizard(parent, templates) {
  return [
    {
      title: get("enum.wizard.title.add"),
      primary: {
        icon: "add",
        label: get("add"),
        action: createAction(parent, templates)
      },
      content: [
        html`<mwc-select
          style="--mdc-menu-max-height: 196px;"
          outlined
          icon="playlist_add_check"
          label="values"
          helper="Default enumerations"
        >
          ${Array.from(templates.querySelectorAll("EnumType")).map((e) => html`<mwc-list-item
                graphic="icon"
                hasMeta
                value="${e.getAttribute("id") ?? ""}"
                ><span>${e.getAttribute("id")}</span>
                <span slot="meta">${e.querySelectorAll("EnumVal").length}</span>
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
        ></wizard-textfield>`
      ]
    }
  ];
}
export function eNumTypeEditWizard(eNumTypeIdentity, doc) {
  const enumtype = doc.querySelector(selector("EnumType", eNumTypeIdentity));
  if (!enumtype)
    return void 0;
  return [
    {
      title: get("enum.wizard.title.edit"),
      element: enumtype,
      primary: {
        icon: "",
        label: get("save"),
        action: updateIDNamingAction(enumtype)
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
              parent: enumtype.parentElement,
              element: enumtype,
              reference: enumtype.nextSibling
            }
          }));
        }}
          fullwidth
        ></mwc-button> `,
        html`<wizard-textfield
          label="id"
          helper="${translate("scl.id")}"
          .maybeValue=${enumtype.getAttribute("id")}
          required
          maxlength="127"
          minlength="1"
          pattern="${patterns.nmToken}"
          dialogInitialFocus
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="desc"
          helper="${translate("scl.desc")}"
          .maybeValue=${enumtype.getAttribute("desc")}
          nullable
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<mwc-button
            slot="graphic"
            icon="playlist_add"
            label="${translate("scl.EnumVal")}"
            @click=${(e) => {
          const wizard = eNumValWizard({
            parent: enumtype
          });
          if (wizard)
            e.target.dispatchEvent(newWizardEvent(wizard));
          e.target.dispatchEvent(newWizardEvent());
        }}
          ></mwc-button>
          <mwc-list
            style="margin-top: 0px;"
            @selected=${(e) => {
          const wizard = eNumValWizard({
            identity: e.target.selected.value,
            doc
          });
          if (wizard)
            e.target.dispatchEvent(newWizardEvent(wizard));
          e.target.dispatchEvent(newWizardEvent());
        }}
            >${Array.from(enumtype.querySelectorAll("EnumVal")).map((enumval) => html`<mwc-list-item
                  graphic="icon"
                  hasMeta
                  tabindex="0"
                  value="${identity(enumval)}"
                >
                  <span>${enumval.textContent ?? ""}</span>
                  <span slot="graphic"
                    >${enumval.getAttribute("ord") ?? "-1"}</span
                  >
                </mwc-list-item>`)}</mwc-list
          > `
      ]
    }
  ];
}
