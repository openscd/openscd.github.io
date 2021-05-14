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
  getReference,
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
import {guessVoltageLevel} from "./guess-wizard.js";
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
      const guess = wizard.shadowRoot?.querySelector("mwc-checkbox")?.checked;
      parent.ownerDocument.createElement("Substation");
      const element = createElement(parent.ownerDocument, "Substation", {
        name,
        desc
      });
      const action = {
        new: {
          parent,
          element,
          reference: getReference(parent, "Substation")
        }
      };
      if (guess)
        wizard.dispatchEvent(newWizardEvent(guessVoltageLevel(parent.ownerDocument)));
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
      desc,
      guessable
    ] = isCreateOptions(options) ? [
      get("substation.wizard.title.add"),
      get("add"),
      "add",
      SubstationEditor.createAction(options.parent),
      "",
      "",
      options.parent.querySelector(":root > IED")
    ] : [
      get("substation.wizard.title.edit"),
      get("save"),
      "edit",
      updateNamingAction(options.element),
      options.element.getAttribute("name"),
      options.element.getAttribute("desc"),
      false
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
            nullable
            helper="${translate("substation.wizard.descHelper")}"
          ></wizard-textfield>`,
          guessable ? html`<mwc-formfield label="${translate("guess.wizard.primary")}">
                <mwc-checkbox></mwc-checkbox>
              </mwc-formfield>` : html``
        ]
      }
    ];
  }
};
SubstationEditor.styles = css`
    ${styles}

    section {
      overflow: hidden;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property({attribute: false})
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
