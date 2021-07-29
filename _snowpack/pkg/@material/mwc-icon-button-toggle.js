import { _ as __decorate } from '../common/tslib.es6-c8bbf354.js';
import { s as style } from '../common/mwc-icon-button-css-a8ee8565.js';
import { q as query, p as property, a as queryAsync, i as internalProperty, e as eventOptions, L as LitElement, b as customElement } from '../common/lit-element-74f197f8.js';
import { R as RippleHandlers } from '../common/ripple-handlers-4224bc9a.js';
import { a as ariaProperty } from '../common/aria-property-0d16a9b7.js';
import { c as classMap } from '../common/class-map-0a052906.js';
import { i as ifDefined } from '../common/if-defined-c0cf727b.js';
import { h as html } from '../common/lit-html-ea288526.js';
import '../common/render-aa9814af.js';
import '../common/foundation-4a2d7e81.js';
import '../common/style-map-a83cef12.js';

/** @soyCompatible */
class IconButtonToggleBase extends LitElement {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.onIcon = '';
        this.offIcon = '';
        this.on = false;
        this.shouldRenderRipple = false;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            return this.ripple;
        });
    }
    handleClick() {
        this.on = !this.on;
        this.dispatchEvent(new CustomEvent('icon-button-toggle-change', { detail: { isOn: this.on }, bubbles: true }));
    }
    click() {
        this.mdcRoot.focus();
        this.mdcRoot.click();
    }
    focus() {
        this.rippleHandlers.startFocus();
        this.mdcRoot.focus();
    }
    blur() {
        this.rippleHandlers.endFocus();
        this.mdcRoot.blur();
    }
    /** @soyTemplate */
    renderRipple() {
        return this.shouldRenderRipple ? html `
            <mwc-ripple
                .disabled="${this.disabled}"
                unbounded>
            </mwc-ripple>` :
            '';
    }
    /** @soyTemplate */
    render() {
        /** @classMap */
        const classes = {
            'mdc-icon-button--on': this.on,
        };
        const hasToggledAriaLabel = this.ariaLabelOn !== undefined && this.ariaLabelOff !== undefined;
        const ariaPressedValue = hasToggledAriaLabel ? undefined : this.on;
        const ariaLabelValue = hasToggledAriaLabel ?
            (this.on ? this.ariaLabelOn : this.ariaLabelOff) :
            this.ariaLabel;
        return html `<button
          class="mdc-icon-button ${classMap(classes)}"
          aria-pressed="${ifDefined(ariaPressedValue)}"
          aria-label="${ifDefined(ariaLabelValue)}"
          @click="${this.handleClick}"
          ?disabled="${this.disabled}"
          @focus="${this.handleRippleFocus}"
          @blur="${this.handleRippleBlur}"
          @mousedown="${this.handleRippleMouseDown}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleTouchStart}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}"
        >${this.renderRipple()}
        <span class="mdc-icon-button__icon"
          ><slot name="offIcon"
            ><i class="material-icons">${this.offIcon}</i
          ></slot
        ></span>
        <span class="mdc-icon-button__icon mdc-icon-button__icon--on"
          ><slot name="onIcon"
            ><i class="material-icons">${this.onIcon}</i
          ></slot
        ></span>
      </button>`;
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
}
__decorate([
    query('.mdc-icon-button')
], IconButtonToggleBase.prototype, "mdcRoot", void 0);
__decorate([
    ariaProperty,
    property({ type: String, attribute: 'aria-label' })
], IconButtonToggleBase.prototype, "ariaLabel", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], IconButtonToggleBase.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], IconButtonToggleBase.prototype, "onIcon", void 0);
__decorate([
    property({ type: String })
], IconButtonToggleBase.prototype, "offIcon", void 0);
__decorate([
    property({ type: String })
], IconButtonToggleBase.prototype, "ariaLabelOn", void 0);
__decorate([
    property({ type: String })
], IconButtonToggleBase.prototype, "ariaLabelOff", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], IconButtonToggleBase.prototype, "on", void 0);
__decorate([
    queryAsync('mwc-ripple')
], IconButtonToggleBase.prototype, "ripple", void 0);
__decorate([
    internalProperty()
], IconButtonToggleBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    eventOptions({ passive: true })
], IconButtonToggleBase.prototype, "handleRippleMouseDown", null);
__decorate([
    eventOptions({ passive: true })
], IconButtonToggleBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let IconButtonToggle = class IconButtonToggle extends IconButtonToggleBase {
};
IconButtonToggle.styles = style;
IconButtonToggle = __decorate([
    customElement('mwc-icon-button-toggle')
], IconButtonToggle);

export { IconButtonToggle };
