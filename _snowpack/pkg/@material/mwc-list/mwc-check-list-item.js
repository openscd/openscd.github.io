import { _ as __decorate } from '../../common/tslib.es6-ea9e4e3f.js';
import { q as query, p as property, b as customElement } from '../../common/lit-element-d8235cfe.js';
import '../mwc-checkbox.js';
import { c as classMap } from '../../common/class-map-ad24d1e8.js';
import { L as ListItemBase, s as styles } from '../../common/mwc-list-item.css-767fd8d7.js';
import { h as html } from '../../common/lit-html-fbfed138.js';
import { s as styles$1 } from '../../common/mwc-control-list-item.css-8abc7d2f.js';
import '../../common/render-4b4a16b9.js';
import '../../common/ripple-handlers-959621dd.js';
import '../../common/ponyfill-4ccc5f83.js';
import '../../common/foundation-dcca5e00.js';
import '../../common/style-map-0182b6c2.js';
import '../../common/aria-property-c2d6d3d3.js';
import '../../common/form-element-6ed93689.js';
import '../../common/if-defined-d8369db9.js';
import '../../common/observer-2c150244.js';

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let CheckListItem = class CheckListItem extends CheckListItemBase {
};
CheckListItem.styles = [styles, styles$1];
CheckListItem = __decorate([
    customElement('mwc-check-list-item')
], CheckListItem);

export { CheckListItem };
