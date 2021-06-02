import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { LitElement, customElement } from '../../../_snowpack/pkg/lit-element.js';
import { Plugging } from '../../src/Plugging.js';
import { Editing } from '../../src/Editing.js';
let MockPlugger = class MockPlugger extends Plugging(Editing(LitElement)) {
};
MockPlugger = __decorate([
    customElement('mock-plugger')
], MockPlugger);
export { MockPlugger };
//# sourceMappingURL=mock-plugger.js.map