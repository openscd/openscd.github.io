import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { LitElement, customElement } from '../../_snowpack/pkg/lit-element.js';
import { Editing } from '../src/Editing.js';
import { Logging } from '../src/Logging.js';
let MockEditorLogger = class MockEditorLogger extends Editing(Logging(LitElement)) {
};
MockEditorLogger = __decorate([
    customElement('mock-editor-logger')
], MockEditorLogger);
export { MockEditorLogger };
//# sourceMappingURL=mock-editor-logger.js.map