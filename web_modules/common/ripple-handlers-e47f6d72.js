import { h as html } from './lit-html-8cd1c43a.js';
import { p as property, i as internalProperty, q as query, c as css, b as customElement } from './lit-element-9d4d66cf.js';
import { B as BaseElement } from './foundation-65aa466e.js';
import { M as MDCRippleFoundation } from './foundation-73a9e2aa.js';
import { c as classMap } from './class-map-857fe98d.js';
import { s as styleMap } from './style-map-503b29fc.js';

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

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/** @soyCompatible */
class RippleBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.primary = false;
        this.accent = false;
        this.unbounded = false;
        this.disabled = false;
        this.activated = false;
        this.selected = false;
        this.hovering = false;
        this.bgFocused = false;
        this.fgActivation = false;
        this.fgDeactivation = false;
        this.fgScale = '';
        this.fgSize = '';
        this.translateStart = '';
        this.translateEnd = '';
        this.leftPos = '';
        this.topPos = '';
        this.mdcFoundationClass = MDCRippleFoundation;
    }
    get isActive() {
        return (this.parentElement || this).matches(':active');
    }
    createAdapter() {
        return {
            browserSupportsCssVars: () => true,
            isUnbounded: () => this.unbounded,
            isSurfaceActive: () => this.isActive,
            isSurfaceDisabled: () => this.disabled,
            addClass: (className) => {
                switch (className) {
                    case 'mdc-ripple-upgraded--background-focused':
                        this.bgFocused = true;
                        break;
                    case 'mdc-ripple-upgraded--foreground-activation':
                        this.fgActivation = true;
                        break;
                    case 'mdc-ripple-upgraded--foreground-deactivation':
                        this.fgDeactivation = true;
                        break;
                }
            },
            removeClass: (className) => {
                switch (className) {
                    case 'mdc-ripple-upgraded--background-focused':
                        this.bgFocused = false;
                        break;
                    case 'mdc-ripple-upgraded--foreground-activation':
                        this.fgActivation = false;
                        break;
                    case 'mdc-ripple-upgraded--foreground-deactivation':
                        this.fgDeactivation = false;
                        break;
                }
            },
            containsEventTarget: () => true,
            registerInteractionHandler: () => undefined,
            deregisterInteractionHandler: () => undefined,
            registerDocumentInteractionHandler: () => undefined,
            deregisterDocumentInteractionHandler: () => undefined,
            registerResizeHandler: () => undefined,
            deregisterResizeHandler: () => undefined,
            updateCssVariable: (varName, value) => {
                switch (varName) {
                    case '--mdc-ripple-fg-scale':
                        this.fgScale = value;
                        break;
                    case '--mdc-ripple-fg-size':
                        this.fgSize = value;
                        break;
                    case '--mdc-ripple-fg-translate-end':
                        this.translateEnd = value;
                        break;
                    case '--mdc-ripple-fg-translate-start':
                        this.translateStart = value;
                        break;
                    case '--mdc-ripple-left':
                        this.leftPos = value;
                        break;
                    case '--mdc-ripple-top':
                        this.topPos = value;
                        break;
                }
            },
            computeBoundingRect: () => (this.parentElement || this).getBoundingClientRect(),
            getWindowPageOffset: () => ({ x: window.pageXOffset, y: window.pageYOffset }),
        };
    }
    startPress(ev) {
        this.waitForFoundation(() => {
            this.mdcFoundation.activate(ev);
        });
    }
    endPress() {
        this.waitForFoundation(() => {
            this.mdcFoundation.deactivate();
        });
    }
    startFocus() {
        this.waitForFoundation(() => {
            this.mdcFoundation.handleFocus();
        });
    }
    endFocus() {
        this.waitForFoundation(() => {
            this.mdcFoundation.handleBlur();
        });
    }
    startHover() {
        this.hovering = true;
    }
    endHover() {
        this.hovering = false;
    }
    /**
     * Wait for the MDCFoundation to be created by `firstUpdated`
     */
    waitForFoundation(fn) {
        if (this.mdcFoundation) {
            fn();
        }
        else {
            this.updateComplete.then(fn);
        }
    }
    /** @soyTemplate */
    render() {
        /** @classMap */
        const classes = {
            'mdc-ripple-upgraded--unbounded': this.unbounded,
            'mdc-ripple-upgraded--background-focused': this.bgFocused,
            'mdc-ripple-upgraded--foreground-activation': this.fgActivation,
            'mdc-ripple-upgraded--foreground-deactivation': this.fgDeactivation,
            'hover': this.hovering,
            'primary': this.primary,
            'accent': this.accent,
            'disabled': this.disabled,
            'activated': this.activated,
            'selected': this.selected,
        };
        return html `
        <div class="mdc-ripple-surface mdc-ripple-upgraded ${classMap(classes)}"
          style="${styleMap({
            '--mdc-ripple-fg-scale': this.fgScale,
            '--mdc-ripple-fg-size': this.fgSize,
            '--mdc-ripple-fg-translate-end': this.translateEnd,
            '--mdc-ripple-fg-translate-start': this.translateStart,
            '--mdc-ripple-left': this.leftPos,
            '--mdc-ripple-top': this.topPos,
        })}"></div>`;
    }
}
__decorate([
    query('.mdc-ripple-surface')
], RippleBase.prototype, "mdcRoot", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "primary", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "accent", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "unbounded", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "activated", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "selected", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "hovering", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "bgFocused", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgActivation", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgDeactivation", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgScale", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgSize", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "translateStart", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "translateEnd", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "leftPos", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "topPos", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

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
const style = css `:host{display:block;position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host .primary{--mdc-ripple-color: var(--mdc-theme-primary, #6200ee)}:host .accent{--mdc-ripple-color: var( --mdc-theme-secondary, #018786 )}:host .mdc-ripple-surface{top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none;--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:relative;outline:none;overflow:hidden;--mdc-ripple-fg-opacity: var( --mdc-ripple-press-opacity, 0.12 )}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}:host .mdc-ripple-surface::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}:host .mdc-ripple-surface.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}:host .mdc-ripple-surface.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}:host .mdc-ripple-surface.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}:host .mdc-ripple-surface.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}:host .mdc-ripple-surface.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded{overflow:visible}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::before,:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::before,:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}:host .mdc-ripple-surface.mdc-ripple-upgraded--background-focused::before{opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{background-color:#000;background-color:var(--mdc-ripple-color, #000)}:host .mdc-ripple-surface.activated{--mdc-ripple-press-opacity: calc( var(--mdc-ripple-press-opacity, 0.12) + 0.12 )}:host .mdc-ripple-surface.activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}:host .mdc-ripple-surface.activated.hover::before{opacity:.16;opacity:calc( var(--mdc-ripple-hover-opacity, 0.04) + var(--mdc-ripple-activated-opacity, 0.12) )}:host .mdc-ripple-surface.activated.mdc-ripple-upgraded--background-focused::before{opacity:.24;opacity:calc( var(--mdc-ripple-focus-opacity, 0.12) + var(--mdc-ripple-activated-opacity, 0.12) )}:host .mdc-ripple-surface.selected{--mdc-ripple-press-opacity: calc( var(--mdc-ripple-press-opacity, 0.12) + 0.08 )}:host .mdc-ripple-surface.selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}:host .mdc-ripple-surface.selected.hover::before{opacity:.12;opacity:calc( var(--mdc-ripple-hover-opacity, 0.04) + var(--mdc-ripple-selected-opacity, 0.08) )}:host .mdc-ripple-surface.selected.mdc-ripple-upgraded--background-focused::before{opacity:.2;opacity:calc( var(--mdc-ripple-focus-opacity, 0.12) + var(--mdc-ripple-selected-opacity, 0.08) )}:host .mdc-ripple-surface.disabled{--mdc-ripple-color: transparent}:host .mdc-ripple-surface::before{z-index:1;z-index:var(--m-ripple-z-index, 1)}:host .mdc-ripple-surface::after{z-index:0;z-index:var(--m-ripple-z-index, 0)}`;

/** @soyCompatible */
let Ripple = class Ripple extends RippleBase {
};
Ripple.styles = style;
Ripple = __decorate([
    customElement('mwc-ripple')
], Ripple);

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

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
/**
 * Class that encapsulates the events handlers for `mwc-ripple`
 *
 *
 * Example:
 * ```
 * class XFoo extends LitElement {
 *   async getRipple() {
 *     this.renderRipple = true;
 *     await this.updateComplete;
 *     return this.renderRoot.querySelector('mwc-ripple');
 *   }
 *   rippleHandlers = new RippleHandlers(() => this.getRipple());
 *
 *   render() {
 *     return html`
 *       <div @mousedown=${this.rippleHandlers.startPress}></div>
 *       ${this.renderRipple ? html`<mwc-ripple></mwc-ripple>` : ''}
 *     `;
 *   }
 * }
 * ```
 */
class RippleHandlers {
    constructor(
    /** Function that returns a `mwc-ripple` */
    rippleFn) {
        this.startPress = (ev) => {
            rippleFn().then((r) => {
                r && r.startPress(ev);
            });
        };
        this.endPress = () => {
            rippleFn().then((r) => {
                r && r.endPress();
            });
        };
        this.startFocus = () => {
            rippleFn().then((r) => {
                r && r.startFocus();
            });
        };
        this.endFocus = () => {
            rippleFn().then((r) => {
                r && r.endFocus();
            });
        };
        this.startHover = () => {
            rippleFn().then((r) => {
                r && r.startHover();
            });
        };
        this.endHover = () => {
            rippleFn().then((r) => {
                r && r.endHover();
            });
        };
    }
}

export { RippleHandlers as R };
