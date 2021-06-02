import { _ as __decorate } from '../../common/index-3b961e0a.js';
import { q as query, p as property, b as customElement } from '../../common/lit-element-20d2221c.js';
import '../mwc-checkbox.js';
import { c as classMap } from '../../common/class-map-f3820f9a.js';
import { L as ListItemBase, s as style } from '../../common/mwc-list-item-css-4e3b411c.js';
import { h as html } from '../../common/lit-html-44a7bec9.js';
import { s as style$1 } from '../../common/mwc-control-list-item-css-e3107f09.js';
import '../../common/render-4f397355.js';
import '../../common/ripple-handlers-d87ebe58.js';
import '../../common/foundation-68a89ff7.js';
import '../../common/style-map-b311a692.js';
import '../../common/aria-property-0d16a9b7.js';
import '../../common/form-element-273bea67.js';
import '../../common/if-defined-4f9ccd15.js';
import '../../common/observer-fa3d205e.js';

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
class CheckListItemBase extends ListItemBase {
    constructor() {
        super(...arguments);
        this.left = false;
        this.graphic = 'control';
    }
    render() {
        const checkboxClasses = {
            'mdc-deprecated-list-item__graphic': this.left,
            'mdc-deprecated-list-item__meta': !this.left,
        };
        const text = this.renderText();
        const graphic = this.graphic && this.graphic !== 'control' && !this.left ?
            this.renderGraphic() :
            html ``;
        const meta = this.hasMeta && this.left ? this.renderMeta() : html ``;
        const ripple = this.renderRipple();
        return html `
      ${ripple}
      ${graphic}
      ${this.left ? '' : text}
      <span class=${classMap(checkboxClasses)}>
        <mwc-checkbox
            reducedTouchTarget
            tabindex=${this.tabindex}
            .checked=${this.selected}
            ?disabled=${this.disabled}
            @change=${this.onChange}>
        </mwc-checkbox>
      </span>
      ${this.left ? text : ''}
      ${meta}`;
    }
    async onChange(evt) {
        const checkbox = evt.target;
        const changeFromProp = this.selected === checkbox.checked;
        if (!changeFromProp) {
            this._skipPropRequest = true;
            this.selected = checkbox.checked;
            await this.updateComplete;
            this._skipPropRequest = false;
        }
    }
}
__decorate([
    query('slot')
], CheckListItemBase.prototype, "slotElement", void 0);
__decorate([
    query('mwc-checkbox')
], CheckListItemBase.prototype, "checkboxElement", void 0);
__decorate([
    property({ type: Boolean })
], CheckListItemBase.prototype, "left", void 0);
__decorate([
    property({ type: String, reflect: true })
], CheckListItemBase.prototype, "graphic", void 0);

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
let CheckListItem = class CheckListItem extends CheckListItemBase {
};
CheckListItem.styles = [style, style$1];
CheckListItem = __decorate([
    customElement('mwc-check-list-item')
], CheckListItem);

export { CheckListItem };
