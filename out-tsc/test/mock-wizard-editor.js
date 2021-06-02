import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { Wizarding } from '../src/Wizarding.js';
import { Editing } from '../src/Editing.js';
import { LitElement, customElement } from '../../_snowpack/pkg/lit-element.js';
let MockWizardEditor = class MockWizardEditor extends Wizarding(Editing(LitElement)) {
};
MockWizardEditor = __decorate([
    customElement('mock-wizard-editor')
], MockWizardEditor);
export { MockWizardEditor };
//# sourceMappingURL=mock-wizard-editor.js.map