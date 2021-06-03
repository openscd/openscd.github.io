import { _ as __decorate } from '../common/tslib.es6-f4316a58.js';
import { s as style } from '../common/mwc-icon-button-css-825f0bdf.js';
import { q as query, p as property, a as queryAsync, i as internalProperty, e as eventOptions, b as customElement } from '../common/lit-element-7a71a97f.js';
import { R as RippleHandlers } from '../common/ripple-handlers-580c686b.js';
import { M as MDCFoundation, B as BaseElement, a as addHasRemoveClass } from '../common/foundation-788d2208.js';
import { o as observer } from '../common/observer-fa3d205e.js';
import { h as html } from '../common/lit-html-ea288526.js';
import '../common/render-aa9814af.js';
import '../common/class-map-0a052906.js';
import '../common/style-map-a83cef12.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses = {
    ICON_BUTTON_ON: 'mdc-icon-button--on',
    ROOT: 'mdc-icon-button',
};
var strings = {
    ARIA_LABEL: 'aria-label',
    ARIA_PRESSED: 'aria-pressed',
    DATA_ARIA_LABEL_OFF: 'data-aria-label-off',
    DATA_ARIA_LABEL_ON: 'data-aria-label-on',
    CHANGE_EVENT: 'MDCIconButtonToggle:change',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCIconButtonToggleFoundation = /** @class */ (function (_super) {
    __extends(MDCIconButtonToggleFoundation, _super);
    function MDCIconButtonToggleFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCIconButtonToggleFoundation.defaultAdapter), adapter)) || this;
        /**
         * Whether the icon button has an aria label that changes depending on
         * toggled state.
         */
        _this.hasToggledAriaLabel = false;
        return _this;
    }
    Object.defineProperty(MDCIconButtonToggleFoundation, "cssClasses", {
        get: function () {
            return cssClasses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCIconButtonToggleFoundation, "strings", {
        get: function () {
            return strings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCIconButtonToggleFoundation, "defaultAdapter", {
        get: function () {
            return {
                addClass: function () { return undefined; },
                hasClass: function () { return false; },
                notifyChange: function () { return undefined; },
                removeClass: function () { return undefined; },
                getAttr: function () { return null; },
                setAttr: function () { return undefined; },
            };
        },
        enumerable: true,
        configurable: true
    });
    MDCIconButtonToggleFoundation.prototype.init = function () {
        var ariaLabelOn = this.adapter.getAttr(strings.DATA_ARIA_LABEL_ON);
        var ariaLabelOff = this.adapter.getAttr(strings.DATA_ARIA_LABEL_OFF);
        if (ariaLabelOn && ariaLabelOff) {
            if (this.adapter.getAttr(strings.ARIA_PRESSED) !== null) {
                throw new Error('MDCIconButtonToggleFoundation: Button should not set ' +
                    '`aria-pressed` if it has a toggled aria label.');
            }
            this.hasToggledAriaLabel = true;
        }
        else {
            this.adapter.setAttr(strings.ARIA_PRESSED, String(this.isOn()));
        }
    };
    MDCIconButtonToggleFoundation.prototype.handleClick = function () {
        this.toggle();
        this.adapter.notifyChange({ isOn: this.isOn() });
    };
    MDCIconButtonToggleFoundation.prototype.isOn = function () {
        return this.adapter.hasClass(cssClasses.ICON_BUTTON_ON);
    };
    MDCIconButtonToggleFoundation.prototype.toggle = function (isOn) {
        if (isOn === void 0) { isOn = !this.isOn(); }
        // Toggle UI based on state.
        if (isOn) {
            this.adapter.addClass(cssClasses.ICON_BUTTON_ON);
        }
        else {
            this.adapter.removeClass(cssClasses.ICON_BUTTON_ON);
        }
        // Toggle aria attributes based on state.
        if (this.hasToggledAriaLabel) {
            var ariaLabel = isOn ?
                this.adapter.getAttr(strings.DATA_ARIA_LABEL_ON) :
                this.adapter.getAttr(strings.DATA_ARIA_LABEL_OFF);
            this.adapter.setAttr(strings.ARIA_LABEL, ariaLabel || '');
        }
        else {
            this.adapter.setAttr(strings.ARIA_PRESSED, "" + isOn);
        }
    };
    return MDCIconButtonToggleFoundation;
}(MDCFoundation));

class IconButtonToggleBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCIconButtonToggleFoundation;
        this.label = '';
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
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { getAttr: (name) => {
                return this.mdcRoot.getAttribute(name);
            }, setAttr: (name, value) => {
                this.mdcRoot.setAttribute(name, value);
            }, notifyChange: (evtData) => {
                this.dispatchEvent(new CustomEvent('MDCIconButtonToggle:change', { detail: evtData, bubbles: true }));
            } });
    }
    handleClick() {
        this.on = !this.on;
        this.mdcFoundation.handleClick();
    }
    focus() {
        this.rippleHandlers.startFocus();
        this.mdcRoot.focus();
    }
    blur() {
        this.rippleHandlers.endFocus();
        this.mdcRoot.blur();
    }
    renderRipple() {
        return this.shouldRenderRipple ? html `
            <mwc-ripple
                .disabled="${this.disabled}"
                unbounded>
            </mwc-ripple>` :
            '';
    }
    render() {
        return html `
      <button
          class="mdc-icon-button"
          @click="${this.handleClick}"
          aria-label="${this.label}"
          ?disabled="${this.disabled}"
          @focus="${this.handleRippleFocus}"
          @blur="${this.handleRippleBlur}"
          @mousedown="${this.handleRippleMouseDown}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleTouchStart}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}">
        ${this.renderRipple()}
        <span class="mdc-icon-button__icon">
          <slot name="offIcon">
            <i class="material-icons">${this.offIcon}</i>
          </slot>
        </span>
        <span class="mdc-icon-button__icon mdc-icon-button__icon--on">
          <slot name="onIcon">
            <i class="material-icons">${this.onIcon}</i>
          </slot>
        </span>
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
    property({ type: String })
], IconButtonToggleBase.prototype, "label", void 0);
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
    property({ type: Boolean, reflect: true }),
    observer(function (state) {
        this.mdcFoundation.toggle(state);
    })
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
