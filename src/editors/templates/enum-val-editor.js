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
  css,
  customElement,
  html,
  LitElement,
  property
} from "../../../_snowpack/pkg/lit-element.js";
import {translate, get} from "../../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  getValue,
  newActionEvent,
  newWizardEvent,
  restrictions
} from "../../foundation.js";
import {
  isCreateOptions,
  styles
} from "../substation/foundation.js";
function nextOrd(parent) {
  const maxOrd = Math.max(...Array.from(parent.children).map((child) => parseInt(child.getAttribute("ord") ?? "-2", 10)));
  return isFinite(maxOrd) ? (maxOrd + 1).toString(10) : "0";
}
export let EnumValEditor = class extends LitElement {
  get ord() {
    return this.element.getAttribute("ord") ?? "-1";
  }
  get desc() {
    return this.element.getAttribute("desc");
  }
  get value() {
    return this.element.textContent ?? "";
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(EnumValEditor.wizard({element: this.element}), {
      detail: {subwizard: true}
    }));
  }
  render() {
    return html`<mwc-list-item
      @click=${() => this.openEditWizard()}
      graphic="icon"
      hasMeta
      tabindex="0"
    >
      <span>${this.value}</span>
      <span slot="graphic">${this.ord}</span>
      <mwc-icon slot="meta">edit</mwc-icon>
    </mwc-list-item>`;
  }
  static createAction(parent) {
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
          reference: null
        }
      };
      return [action];
    };
  }
  static updateAction(element) {
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
  static wizard(options) {
    const [
      heading,
      actionName,
      actionIcon,
      action,
      ord,
      desc,
      value
    ] = isCreateOptions(options) ? [
      get("enum-val.wizard.title.add"),
      get("add"),
      "add",
      EnumValEditor.createAction(options.parent),
      nextOrd(options.parent),
      null,
      ""
    ] : [
      get("enum-val.wizard.title.edit"),
      get("save"),
      "edit",
      EnumValEditor.updateAction(options.element),
      options.element.getAttribute("ord"),
      options.element.getAttribute("desc"),
      options.element.textContent
    ];
    return [
      {
        title: heading,
        primary: {
          icon: actionIcon,
          label: actionName,
          action
        },
        content: [
          isCreateOptions(options) ? html`` : html`<mwc-button
                icon="delete"
                trailingIcon
                label=${translate("delete")}
                @click=${(e) => {
            e.target.dispatchEvent(newWizardEvent());
            e.target.dispatchEvent(newActionEvent({
              old: {
                parent: options.element.parentElement,
                element: options.element,
                reference: options.element.nextElementSibling
              }
            }));
          }}
                fullwidth
              ></mwc-button>`,
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
            pattern="${restrictions.normalizedString}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            id="evDesc"
            label="desc"
            helper="${translate("scl.desc")}"
            .maybeValue=${desc}
            nullable
            pattern="${restrictions.normalizedString}"
          ></wizard-textfield>`
        ]
      }
    ];
  }
};
EnumValEditor.styles = css`
    ${styles}

    section {
      overflow: auto;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property()
], EnumValEditor.prototype, "element", 2);
__decorate([
  property({type: Number})
], EnumValEditor.prototype, "ord", 1);
__decorate([
  property({type: String})
], EnumValEditor.prototype, "desc", 1);
__decorate([
  property({type: String})
], EnumValEditor.prototype, "value", 1);
EnumValEditor = __decorate([
  customElement("enum-val-editor")
], EnumValEditor);
