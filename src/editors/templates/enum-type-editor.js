var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {
  customElement,
  html,
  LitElement,
  property
} from "../../../web_modules/lit-element.js";
import {repeat as repeat2} from "../../../web_modules/lit-html/directives/repeat.js";
import {translate, get} from "../../../web_modules/lit-translate.js";
import "../../../web_modules/@material/mwc-button.js";
import "../../../web_modules/@material/mwc-icon.js";
import "../../../web_modules/@material/mwc-icon-button.js";
import "../../../web_modules/@material/mwc-list/mwc-list-item.js";
import {
  getValue,
  newActionEvent,
  newWizardEvent,
  restrictions
} from "../../foundation.js";
import {
  isCreateOptions,
  styles,
  updateIDNamingAction
} from "./foundation.js";
import "./enum-val-editor.js";
import {EnumValEditor} from "./enum-val-editor.js";
export let EnumTypeEditor = class extends LitElement {
  get eID() {
    return this.element.getAttribute("id") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc");
  }
  get size() {
    return this.element.querySelectorAll("EnumVal").length;
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(EnumTypeEditor.wizard({element: this.element})));
  }
  render() {
    return html`<mwc-list-item
      @click=${() => this.openEditWizard()}
      graphic="icon"
      hasMeta
      tabindex="0"
    >
      <span>${this.eID}</span>
      <mwc-icon slot="meta">edit</mwc-icon>
      <span slot="graphic">${this.size}</span>
    </mwc-list-item>`;
  }
  static createAction(parent, templates) {
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
          reference: parent.firstElementChild
        }
      };
      return [action];
    };
  }
  static createWizard(parent, templates) {
    return [
      {
        title: get("enum.wizard.title.add"),
        primary: {
          icon: "add",
          label: get("add"),
          action: EnumTypeEditor.createAction(parent, templates)
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
                  <span slot="meta"
                    >${e.querySelectorAll("EnumVal").length}</span
                  >
                </mwc-list-item>`)}
          </mwc-select>`,
          html`<wizard-textfield
            label="id"
            helper="${translate("scl.id")}"
            .maybeValue=""
            required
            maxlength="127"
            minlength="1"
            pattern="${restrictions.nmToken}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            helper="${translate("scl.desc")}"
            .maybeValue=${null}
            nullable
            pattern="${restrictions.normalizedString}"
          ></wizard-textfield>`
        ]
      }
    ];
  }
  static editWizard(element) {
    return [
      {
        title: get("enum.wizard.title.edit"),
        primary: {
          icon: "edit",
          label: get("save"),
          action: updateIDNamingAction(element)
        },
        content: [
          html`<mwc-button
            icon="delete"
            trailingIcon
            label="${translate("delete")}"
            @click=${(e) => {
            e.target.dispatchEvent(newWizardEvent());
            e.target.dispatchEvent(newActionEvent({
              old: {
                parent: element.parentElement,
                element,
                reference: element.nextElementSibling
              }
            }));
          }}
            fullwidth
          ></mwc-button> `,
          html`<wizard-textfield
            label="id"
            helper="${translate("scl.id")}"
            .maybeValue=${element.getAttribute("id")}
            required
            maxlength="127"
            minlength="1"
            pattern="${restrictions.nmToken}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            helper="${translate("scl.desc")}"
            .maybeValue=${element.getAttribute("desc")}
            nullable
            pattern="${restrictions.normalizedString}"
          ></wizard-textfield>`,
          html`<mwc-button
              slot="graphic"
              icon="playlist_add"
              trailingIcon
              label="${translate("scl.EnumVal")}"
              @click=${(e) => e.target.dispatchEvent(newWizardEvent(EnumValEditor.wizard({parent: element}), {
            detail: {subwizard: true}
          }))}
            ></mwc-button>
            <mwc-list style="margin-top: 0px;">
              ${repeat2(element.childNodes, (child) => child instanceof Element ? html`<enum-val-editor
                        .element=${child}
                      ></enum-val-editor>` : html``)}
            </mwc-list> `
        ]
      }
    ];
  }
  static wizard(options) {
    return isCreateOptions(options) ? EnumTypeEditor.createWizard(options.parent, options.templates) : EnumTypeEditor.editWizard(options.element);
  }
};
EnumTypeEditor.styles = styles;
__decorate([
  property()
], EnumTypeEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], EnumTypeEditor.prototype, "eID", 1);
__decorate([
  property({type: String})
], EnumTypeEditor.prototype, "desc", 1);
__decorate([
  property({type: Number})
], EnumTypeEditor.prototype, "size", 1);
EnumTypeEditor = __decorate([
  customElement("enum-type-editor")
], EnumTypeEditor);
