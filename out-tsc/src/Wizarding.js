import { __decorate } from "../../web_modules/tslib.js";
import { html, internalProperty } from '../../web_modules/lit-element.js';
import { ifImplemented, } from './foundation.js';
import './wizard-dialog.js';
export function Wizarding(Base) {
    class WizardingElement extends Base {
        constructor(...args) {
            super(...args);
            this.workflow = [];
            this.addEventListener('wizard', this.onWizard);
        }
        onWizard(we) {
            if (we.detail.wizard === null)
                this.workflow.shift();
            else
                this.workflow.push(we.detail.wizard);
            this.requestUpdate('workflow');
        }
        render() {
            return html `${ifImplemented(super.render())}
      ${this.workflow.length
                ? html `<wizard-dialog .wizard=${this.workflow[0]}></wizard-dialog>`
                : ''}`;
        }
    }
    __decorate([
        internalProperty()
    ], WizardingElement.prototype, "workflow", void 0);
    return WizardingElement;
}
//# sourceMappingURL=Wizarding.js.map