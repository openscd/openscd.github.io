import { _ as __decorate } from '../common/tslib.es6-ea9e4e3f.js';
import { T as TextFieldBase, l as live, s as styles$1 } from '../common/mwc-textfield-base-cf9932ce.js';
import { q as query, p as property, c as css, b as customElement } from '../common/lit-element-d8235cfe.js';
import { c as classMap } from '../common/class-map-ad24d1e8.js';
import { i as ifDefined } from '../common/if-defined-d8369db9.js';
import { h as html } from '../common/lit-html-fbfed138.js';
import '../common/mwc-line-ripple-directive-0e2b63a8.js';
import '../common/foundation-dcca5e00.js';
import '../common/directive-174f07e9.js';
import '../common/form-element-6ed93689.js';
import '../common/observer-2c150244.js';
import '../common/render-4b4a16b9.js';

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const booleanOrStringConverter = {
    fromAttribute(value) {
        if (value === null) {
            return false;
        }
        else if (value === '') {
            return true;
        }
        return value;
    },
    toAttribute(value) {
        if (typeof value === 'boolean') {
            return value ? '' : null;
        }
        return value;
    }
};
/** @soyCompatible */
class TextAreaBase extends TextFieldBase {
    constructor() {
        super(...arguments);
        this.rows = 2;
        this.cols = 20;
        this.charCounter = false;
    }
    /** @soyTemplate */
    render() {
        const shouldRenderCharCounter = this.charCounter && this.maxLength !== -1;
        const shouldRenderInternalCharCounter = shouldRenderCharCounter && this.charCounter === 'internal';
        const shouldRenderExternalCharCounter = shouldRenderCharCounter && !shouldRenderInternalCharCounter;
        const shouldRenderHelperText = !!this.helper || !!this.validationMessage ||
            shouldRenderExternalCharCounter;
        /** @classMap */
        const classes = {
            'mdc-text-field--disabled': this.disabled,
            'mdc-text-field--no-label': !this.label,
            'mdc-text-field--filled': !this.outlined,
            'mdc-text-field--outlined': this.outlined,
            'mdc-text-field--end-aligned': this.endAligned,
            'mdc-text-field--with-internal-counter': shouldRenderInternalCharCounter,
        };
        return html `
      <label class="mdc-text-field mdc-text-field--textarea ${classMap(classes)}">
        ${this.renderRipple()}
        ${this.outlined ? this.renderOutline() : this.renderLabel()}
        ${this.renderInput()}
        ${this.renderCharCounter(shouldRenderInternalCharCounter)}
        ${this.renderLineRipple()}
      </label>
      ${this.renderHelperText(shouldRenderHelperText, shouldRenderExternalCharCounter)}
    `;
    }
    /** @soyTemplate */
    renderInput() {
        const ariaLabelledbyOrUndef = !!this.label ? 'label' : undefined;
        const minOrUndef = this.minLength === -1 ? undefined : this.minLength;
        const maxOrUndef = this.maxLength === -1 ? undefined : this.maxLength;
        const autocapitalizeOrUndef = this.autocapitalize ?
            this.autocapitalize :
            undefined;
        return html `
      <textarea
          aria-labelledby=${ifDefined(ariaLabelledbyOrUndef)}
          class="mdc-text-field__input"
          .value="${live(this.value)}"
          rows="${this.rows}"
          cols="${this.cols}"
          ?disabled="${this.disabled}"
          placeholder="${this.placeholder}"
          ?required="${this.required}"
          ?readonly="${this.readOnly}"
          minlength="${ifDefined(minOrUndef)}"
          maxlength="${ifDefined(maxOrUndef)}"
          name="${ifDefined(this.name === '' ? undefined : this.name)}"
          inputmode="${ifDefined(this.inputMode)}"
          autocapitalize="${ifDefined(autocapitalizeOrUndef)}"
          @input="${this.handleInputChange}"
          @blur="${this.onInputBlur}">
      </textarea>`;
    }
}
__decorate([
    query('textarea')
], TextAreaBase.prototype, "formElement", void 0);
__decorate([
    property({ type: Number })
], TextAreaBase.prototype, "rows", void 0);
__decorate([
    property({ type: Number })
], TextAreaBase.prototype, "cols", void 0);
__decorate([
    property({ converter: booleanOrStringConverter })
], TextAreaBase.prototype, "charCounter", void 0);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-LIcense-Identifier: Apache-2.0
 */
const styles = css `.mdc-text-field{height:100%}.mdc-text-field__input{resize:none}`;

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/** @soyCompatible */
let TextArea = class TextArea extends TextAreaBase {
};
TextArea.styles = [styles$1, styles];
TextArea = __decorate([
    customElement('mwc-textarea')
], TextArea);

export { TextArea };
