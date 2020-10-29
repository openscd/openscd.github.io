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
  internalProperty,
  property,
  query
} from "../web_modules/lit-element.js";
import {translate, get} from "../web_modules/lit-translate.js";
import "../web_modules/@material/mwc-list/mwc-list-item.js";
import "../web_modules/@material/mwc-menu.js";
import "../web_modules/@material/mwc-switch.js";
import "../web_modules/@material/mwc-textfield.js";
import {TextField} from "../web_modules/@material/mwc-textfield.js";
export let WizardTextField = class extends TextField {
  constructor() {
    super(...arguments);
    this.nullable = false;
    this.multipliers = [null, ""];
    this.multiplierIndex = 0;
    this.unit = "";
    this.isNull = false;
    this.defaultValue = "";
    this.reservedValues = [];
    this.nulled = null;
  }
  get multiplier() {
    if (this.unit == "")
      return null;
    return this.multipliers[this.multiplierIndex] ?? this.multipliers[0] ?? null;
  }
  set multiplier(value) {
    const index = this.multipliers.indexOf(value);
    if (index >= 0)
      this.multiplierIndex = index;
    this.suffix = (this.multiplier ?? "") + this.unit;
  }
  get null() {
    return this.nullable && this.isNull;
  }
  set null(value) {
    if (!this.nullable || value === this.isNull)
      return;
    this.isNull = value;
    if (this.null)
      this.disable();
    else
      this.enable();
  }
  get maybeValue() {
    return this.null ? null : this.value;
  }
  set maybeValue(value) {
    if (value === null)
      this.null = true;
    else {
      this.null = false;
      this.value = value;
    }
  }
  selectMultiplier(se) {
    this.multiplier = this.multipliers[se.detail.index];
  }
  enable() {
    if (this.nulled === null)
      return;
    this.value = this.nulled;
    this.nulled = null;
    this.helperPersistent = false;
    this.disabled = false;
  }
  disable() {
    if (this.nulled !== null)
      return;
    this.nulled = this.value;
    this.value = this.defaultValue;
    this.helperPersistent = true;
    this.disabled = true;
  }
  async firstUpdated() {
    await super.firstUpdated();
    if (this.multiplierMenu)
      this.multiplierMenu.anchor = this.multiplierButton ?? null;
  }
  checkValidity() {
    if (this.reservedValues && this.reservedValues.some((array) => array === this.value)) {
      this.setCustomValidity(get("textfield.unique"));
      return false;
    }
    return super.checkValidity();
  }
  renderUnitSelector() {
    if (this.multipliers.length && this.unit)
      return html`<div style="position:relative;">
        <mwc-icon-button
          style="margin:5px;"
          icon="more"
          ?disabled=${this.null}
          @click=${() => this.multiplierMenu?.show()}
        ></mwc-icon-button>
        <mwc-menu
          @selected=${this.selectMultiplier}
          fixed
          .anchor=${this.multiplierButton ?? null}
          >${this.renderMulplierList()}</mwc-menu
        >
      </div>`;
    else
      return html``;
  }
  renderMulplierList() {
    return html`${this.multipliers.map((multiplier) => html`<mwc-list-item ?selected=${multiplier === this.multiplier}
          >${multiplier === null ? translate("textfield.noMultiplier") : multiplier}</mwc-list-item
        >`)}`;
  }
  renderSwitch() {
    if (this.nullable) {
      return html`<mwc-switch
        style="margin-left: 12px;"
        ?checked=${!this.null}
        @change=${() => {
        this.null = !this.nullSwitch.checked;
      }}
      ></mwc-switch>`;
    }
    return html``;
  }
  render() {
    return html`
      <div style="display: flex; flex-direction: row;">
        <div style="flex: auto;">${super.render()}</div>
        ${this.renderUnitSelector()}
        <div style="display: flex; align-items: center; height: 56px;">
          ${this.renderSwitch()}
        </div>
      </div>
    `;
  }
};
__decorate([
  property({type: Boolean})
], WizardTextField.prototype, "nullable", 2);
__decorate([
  property({type: Array})
], WizardTextField.prototype, "multipliers", 2);
__decorate([
  property({type: String})
], WizardTextField.prototype, "multiplier", 1);
__decorate([
  property({type: String})
], WizardTextField.prototype, "unit", 2);
__decorate([
  internalProperty()
], WizardTextField.prototype, "null", 1);
__decorate([
  property({type: String})
], WizardTextField.prototype, "maybeValue", 1);
__decorate([
  property({type: String})
], WizardTextField.prototype, "defaultValue", 2);
__decorate([
  property({type: Array})
], WizardTextField.prototype, "reservedValues", 2);
__decorate([
  query("mwc-switch")
], WizardTextField.prototype, "nullSwitch", 2);
__decorate([
  query("mwc-menu")
], WizardTextField.prototype, "multiplierMenu", 2);
__decorate([
  query("mwc-icon-button")
], WizardTextField.prototype, "multiplierButton", 2);
WizardTextField = __decorate([
  customElement("wizard-textfield")
], WizardTextField);
