import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { html, internalProperty, query } from '../../_snowpack/pkg/lit-element.js';
import { ifImplemented, } from './foundation.js';
import './wizard-dialog.js';
export function Wizarding(Base) {
    class WizardingElement extends Base {
        constructor(...args) {
            super(...args);
            /** FIFO queue of [[`Wizard`]]s to display. */
            this.workflow = [];
            this.addEventListener('wizard', this.onWizard);
            this.addEventListener('editor-action', () => this.wizardUI.requestUpdate());
        }
        onWizard(we) {
            const wizard = we.detail.wizard;
            if (wizard?.length === 0)
                return;
            if (wizard === null)
                this.workflow.shift();
            else if (we.detail.subwizard)
                this.workflow.unshift(wizard);
            else
                this.workflow.push(wizard);
            this.requestUpdate('workflow');
            this.updateComplete.then(() => this.wizardUI.updateComplete.then(() => this.wizardUI.dialog?.updateComplete.then(() => this.wizardUI.dialog?.focus())));
        }
        render() {
            return html `${ifImplemented(super.render())}
        <wizard-dialog .wizard=${this.workflow[0] ?? []}></wizard-dialog>`;
        }
    }
    __decorate([
        internalProperty()
    ], WizardingElement.prototype, "workflow", void 0);
    __decorate([
        query('wizard-dialog')
    ], WizardingElement.prototype, "wizardUI", void 0);
    return WizardingElement;
}
//# sourceMappingURL=Wizarding.js.map