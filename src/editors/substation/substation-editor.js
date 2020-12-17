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
} from "../../../web_modules/lit-element.js";
import {translate, get} from "../../../web_modules/lit-translate.js";
import "../../../web_modules/@material/mwc-button.js";
import "../../../web_modules/@material/mwc-icon-button.js";
import "../../../web_modules/@material/mwc-list/mwc-list-item.js";
import {
  getValue,
  newActionEvent,
  newWizardEvent
} from "../../foundation.js";
import {
  isCreateOptions,
  selectors,
  styles,
  updateNamingAction
} from "./foundation.js";
import "./voltage-level-editor.js";
import {VoltageLevelEditor} from "./voltage-level-editor.js";
import {editlNode} from "./lnodewizard.js";
export let SubstationEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc");
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(SubstationEditor.wizard({element: this.element})));
  }
  openVoltageLevelWizard() {
    this.dispatchEvent(newWizardEvent(VoltageLevelEditor.wizard({parent: this.element})));
  }
  openLNodeWizard() {
    this.dispatchEvent(newWizardEvent(editlNode(this.element)));
  }
  remove() {
    this.dispatchEvent(newActionEvent({
      old: {
        parent: this.element.parentElement,
        element: this.element,
        reference: this.element.nextElementSibling
      }
    }));
  }
  newUpdateAction(name, desc) {
    const newElement = this.element.cloneNode(false);
    newElement.setAttribute("name", name);
    if (desc === null)
      newElement.removeAttribute("desc");
    else
      newElement.setAttribute("desc", desc);
    return {
      old: {element: this.element},
      new: {element: newElement}
    };
  }
  substationWizardAction(inputs, dialog) {
    const name = inputs.find((i) => i.label === "name").value;
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    if (name === this.name && desc === this.desc)
      return [];
    const action = this.newUpdateAction(name, desc);
    dialog.close();
    return [action];
  }
  constructor() {
    super();
    this.substationWizardAction = this.substationWizardAction.bind(this);
  }
  renderHeader() {
    return html`
      <h1>
        ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
        <abbr title="${translate("add")}">
          <mwc-icon-button
            icon="playlist_add"
            @click=${() => this.openVoltageLevelWizard()}
          ></mwc-icon-button>
        </abbr>
        <nav>
          <abbr title="${translate("lnode.tooltip")}">
            <mwc-icon-button
              icon="account_tree"
              @click=${() => this.openLNodeWizard()}
            ></mwc-icon-button>
          </abbr>
          <abbr title="${translate("edit")}">
            <mwc-icon-button
              icon="edit"
              @click=${() => this.openEditWizard()}
            ></mwc-icon-button>
          </abbr>
          <abbr title="${translate("remove")}">
            <mwc-icon-button
              icon="delete"
              @click=${() => this.remove()}
            ></mwc-icon-button>
          </abbr>
        </nav>
      </h1>
    `;
  }
  static createAction(parent) {
    return (inputs, wizard) => {
      const name = getValue(inputs.find((i) => i.label === "name"));
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      const action = {
        new: {
          parent,
          element: new DOMParser().parseFromString(`<Substation
              name="${name}"
              ${desc === null ? "" : `desc="${desc}"`}
            ></Substation>`, "application/xml").documentElement,
          reference: null
        }
      };
      wizard.close();
      return [action];
    };
  }
  render() {
    return html`
      <section tabindex="0">
        ${this.renderHeader()}
        ${Array.from(this.element.querySelectorAll(selectors.VoltageLevel)).map((voltageLevel) => html`<voltage-level-editor
              .element=${voltageLevel}
            ></voltage-level-editor>`)}
      </section>
    `;
  }
  static wizard(options) {
    const [
      heading,
      actionName,
      actionIcon,
      action,
      name,
      desc
    ] = isCreateOptions(options) ? [
      get("substation.wizard.title.add"),
      get("add"),
      "add",
      SubstationEditor.createAction(options.parent),
      "",
      ""
    ] : [
      get("substation.wizard.title.edit"),
      get("save"),
      "edit",
      updateNamingAction(options.element),
      options.element.getAttribute("name"),
      options.element.getAttribute("desc")
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
          html`<wizard-textfield
            label="name"
            .maybeValue=${name}
            helper="${translate("substation.wizard.nameHelper")}"
            required
            validationMessage="${translate("textfield.required")}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate("substation.wizard.descHelper")}"
          ></wizard-textfield>`
        ]
      }
    ];
  }
};
SubstationEditor.styles = css`
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
], SubstationEditor.prototype, "element", 2);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "name", 1);
__decorate([
  property({type: String})
], SubstationEditor.prototype, "desc", 1);
SubstationEditor = __decorate([
  customElement("substation-editor")
], SubstationEditor);
