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
  LitElement,
  customElement,
  html,
  property,
  css
} from "../../../web_modules/lit-element.js";
import {translate, get} from "../../../web_modules/lit-translate.js";
import {
  newWizardEvent,
  newActionEvent,
  getValue,
  getMultiplier,
  restrictions
} from "../../foundation.js";
import {
  isCreateOptions,
  selectors,
  startMove,
  styles
} from "./foundation.js";
import "./bay-editor.js";
import {BayEditor} from "./bay-editor.js";
import {editlNode} from "./lnodewizard.js";
import {SubstationEditor} from "./substation-editor.js";
const initial = {
  nomFreq: "50",
  numPhases: "3",
  Voltage: "110",
  multiplier: "k"
};
function getVoltageAction(oldVoltage, Voltage, multiplier, voltageLevel) {
  if (oldVoltage === null)
    return {
      new: {
        parent: voltageLevel,
        element: new DOMParser().parseFromString(`<Voltage unit="V"${multiplier === null ? "" : `multiplier="${multiplier}"`}>${Voltage === null ? "" : Voltage}</Voltage>`, "application/xml").documentElement,
        reference: voltageLevel.firstElementChild
      }
    };
  if (Voltage === null)
    return {
      old: {
        parent: voltageLevel,
        element: oldVoltage,
        reference: oldVoltage.nextElementSibling
      }
    };
  const newVoltage = oldVoltage.cloneNode(false);
  newVoltage.textContent = Voltage;
  if (multiplier === null)
    newVoltage.removeAttribute("multiplier");
  else
    newVoltage.setAttribute("multiplier", multiplier);
  return {
    old: {element: oldVoltage},
    new: {element: newVoltage}
  };
}
export let VoltageLevelEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc") ?? null;
  }
  get voltage() {
    const V = this.element.querySelector(selectors.VoltageLevel + " > Voltage");
    if (V === null)
      return null;
    const v = V.textContent ?? "";
    const m = V.getAttribute("multiplier");
    const u = m === null ? "V" : " " + m + "V";
    return v ? v + u : null;
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(VoltageLevelEditor.wizard({element: this.element})));
  }
  openBayWizard() {
    this.dispatchEvent(newWizardEvent(BayEditor.wizard({parent: this.element})));
  }
  openLNodeWizard() {
    this.dispatchEvent(newWizardEvent(editlNode(this.element)));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element,
          reference: this.element.nextElementSibling
        }
      }));
  }
  renderHeader() {
    return html`<h2>
      ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      ${this.voltage === null ? "" : html`(${this.voltage})`}
      <mwc-icon-button
        icon="playlist_add"
        @click=${() => this.openBayWizard()}
      ></mwc-icon-button>
      <nav>
        <mwc-icon-button
          icon="account_tree"
          @click=${() => this.openLNodeWizard()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="forward"
          @click=${() => startMove(this, VoltageLevelEditor, SubstationEditor)}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="delete"
          @click=${() => this.remove()}
        ></mwc-icon-button>
      </nav>
    </h2>`;
  }
  render() {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      <div id="bayContainer">
        ${Array.from(this.element?.querySelectorAll(selectors.Bay) ?? []).map((bay) => html`<bay-editor .element=${bay}></bay-editor>`)}
      </div>
    </section>`;
  }
  static updateAction(element) {
    return (inputs, wizard) => {
      const name = inputs.find((i) => i.label === "name").value;
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      const nomFreq = getValue(inputs.find((i) => i.label === "nomFreq"));
      const numPhases = getValue(inputs.find((i) => i.label === "numPhases"));
      const Voltage = getValue(inputs.find((i) => i.label === "Voltage"));
      const multiplier = getMultiplier(inputs.find((i) => i.label === "Voltage"));
      let voltageLevelAction;
      let voltageAction;
      if (name === element.getAttribute("name") && desc === element.getAttribute("desc") && nomFreq === element.getAttribute("nomFreq") && numPhases === element.getAttribute("numPhases")) {
        voltageLevelAction = null;
      } else {
        const newElement = element.cloneNode(false);
        newElement.setAttribute("name", name);
        if (desc === null)
          newElement.removeAttribute("desc");
        else
          newElement.setAttribute("desc", desc);
        if (nomFreq === null)
          newElement.removeAttribute("nomFreq");
        else
          newElement.setAttribute("nomFreq", nomFreq);
        if (numPhases === null)
          newElement.removeAttribute("numPhases");
        else
          newElement.setAttribute("numPhases", numPhases);
        voltageLevelAction = {old: {element}, new: {element: newElement}};
      }
      if (Voltage === (element.querySelector("VoltageLevel > Voltage")?.textContent?.trim() ?? null) && multiplier === (element.querySelector("VoltageLevel > Voltage")?.getAttribute("multiplier") ?? null)) {
        voltageAction = null;
      } else {
        voltageAction = getVoltageAction(element.querySelector("VoltageLevel > Voltage"), Voltage, multiplier, voltageLevelAction?.new.element ?? element);
      }
      if (voltageLevelAction || voltageAction)
        wizard.close();
      const actions = [];
      if (voltageLevelAction)
        actions.push(voltageLevelAction);
      if (voltageAction)
        actions.push(voltageAction);
      return actions;
    };
  }
  static createAction(parent) {
    return (inputs, wizard) => {
      const name = getValue(inputs.find((i) => i.label === "name"));
      const desc = getValue(inputs.find((i) => i.label === "desc"));
      const nomFreq = getValue(inputs.find((i) => i.label === "nomFreq"));
      const numPhases = getValue(inputs.find((i) => i.label === "numPhases"));
      const Voltage = getValue(inputs.find((i) => i.label === "Voltage"));
      const multiplier = getMultiplier(inputs.find((i) => i.label === "Voltage"));
      const action = {
        new: {
          parent,
          element: new DOMParser().parseFromString(`<VoltageLevel
              name="${name}"
              ${desc === null ? "" : `desc="${desc}"`}
              ${nomFreq === null ? "" : `nomFreq="${nomFreq}"`}
              ${numPhases === null ? "" : `numPhases="${numPhases}"`}
            >${Voltage === null ? "" : `<Voltage unit="V" ${multiplier === null ? "" : `multiplier="${multiplier}"`}
            >${Voltage}</Voltage>`}</VoltageLevel>`, "application/xml").documentElement,
          reference: null
        }
      };
      wizard.close();
      return [action];
    };
  }
  static wizard(options) {
    const [
      heading,
      actionName,
      actionIcon,
      action,
      name,
      desc,
      nomFreq,
      numPhases,
      Voltage,
      multiplier
    ] = isCreateOptions(options) ? [
      get("voltagelevel.wizard.title.add"),
      get("add"),
      "add",
      VoltageLevelEditor.createAction(options.parent),
      "",
      null,
      initial.nomFreq,
      initial.numPhases,
      initial.Voltage,
      initial.multiplier
    ] : [
      get("voltagelevel.wizard.title.edit"),
      get("save"),
      "edit",
      VoltageLevelEditor.updateAction(options.element),
      options.element.getAttribute("name"),
      options.element.getAttribute("desc"),
      options.element.getAttribute("nomFreq"),
      options.element.getAttribute("numPhases"),
      options.element.querySelector("VoltageLevel > Voltage")?.textContent?.trim() ?? null,
      options.element.querySelector("VoltageLevel > Voltage")?.getAttribute("multiplier") ?? null
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
            helper="${translate("voltagelevel.wizard.nameHelper")}"
            required
            validationMessage="${translate("textfield.required")}"
            dialogInitialFocus
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate("voltagelevel.wizard.descHelper")}"
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="nomFreq"
            .maybeValue=${nomFreq}
            nullable="true"
            helper="${translate("voltagelevel.wizard.nomFreqHelper")}"
            suffix="Hz"
            required
            validationMessage="${translate("textfield.nonempty")}"
            pattern="${restrictions.unsigned}"
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="numPhases"
            .maybeValue=${numPhases}
            nullable="true"
            helper="${translate("voltagelevel.wizard.numPhaseHelper")}"
            suffix="#"
            required
            validationMessage="${translate("textfield.nonempty")}"
            type="number"
            min="1"
            max="255"
          ></wizard-textfield>`,
          html`<wizard-textfield
            label="Voltage"
            .maybeValue=${Voltage}
            nullable
            unit="V"
            .multipliers=${[null, "G", "M", "k", "", "m"]}
            .multiplier=${multiplier}
            helper="${translate("voltagelevel.wizard.voltageHelper")}"
            required
            validationMessage="${translate("textfield.nonempty")}"
            pattern="${restrictions.decimal}"
          ></wizard-textfield>`
        ]
      }
    ];
  }
};
VoltageLevelEditor.styles = css`
    ${styles}

    section {
      background-color: var(--mdc-theme-on-primary);
    }

    #bayContainer {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #bayContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
__decorate([
  property()
], VoltageLevelEditor.prototype, "element", 2);
__decorate([
  property()
], VoltageLevelEditor.prototype, "name", 1);
__decorate([
  property()
], VoltageLevelEditor.prototype, "desc", 1);
__decorate([
  property()
], VoltageLevelEditor.prototype, "voltage", 1);
VoltageLevelEditor = __decorate([
  customElement("voltage-level-editor")
], VoltageLevelEditor);
