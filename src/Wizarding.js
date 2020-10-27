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
import {html, internalProperty} from "../web_modules/lit-element.js";
import {
  ifImplemented
} from "./foundation.js";
import "./wizard-dialog.js";
export function Wizarding(Base) {
  class WizardingElement extends Base {
    constructor(...args) {
      super(...args);
      this.workflow = [];
      this.addEventListener("wizard", this.onWizard);
    }
    onWizard(we) {
      if (we.detail.wizard === null)
        this.workflow.shift();
      else
        this.workflow.push(we.detail.wizard);
      this.requestUpdate("workflow");
    }
    render() {
      return html`${ifImplemented(super.render())}
      ${this.workflow.length ? html`<wizard-dialog .wizard=${this.workflow[0]}></wizard-dialog>` : ""}`;
    }
  }
  __decorate([
    internalProperty()
  ], WizardingElement.prototype, "workflow", 2);
  return WizardingElement;
}
