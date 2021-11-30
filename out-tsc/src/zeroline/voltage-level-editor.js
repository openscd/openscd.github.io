var VoltageLevelEditor_1;
import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { LitElement, customElement, html, property, css, query, } from '../../../_snowpack/pkg/lit-element.js';
import { translate } from '../../../_snowpack/pkg/lit-translate.js';
import { selectors, startMove, cloneSubstationElement, styles, } from './foundation.js';
import { newActionEvent, newWizardEvent, tags } from '../foundation.js';
import { SubstationEditor } from './substation-editor.js';
import { emptyWizard, wizards } from '../wizards/wizard-library.js';
import './bay-editor.js';
import '../action-pane.js';
function childTags(element) {
    if (!element)
        return [];
    return tags[element.tagName].children.filter(child => wizards[child].create !== emptyWizard);
}
/** [[`Substation`]] subeditor for a `VoltageLevel` element. */
let VoltageLevelEditor = VoltageLevelEditor_1 = class VoltageLevelEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.getAttachedIeds = () => {
            return [];
        };
    }
    get voltage() {
        const V = this.element.querySelector(selectors.VoltageLevel + ' > Voltage');
        if (V === null)
            return null;
        const v = V.textContent ?? '';
        const m = V.getAttribute('multiplier');
        const u = m === null ? 'V' : ' ' + m + 'V';
        return v ? v + u : null;
    }
    get header() {
        const name = this.element.getAttribute('name') ?? '';
        const desc = this.element.getAttribute('desc');
        return `${name} ${desc ? `- ${desc}` : ''}
    ${this.voltage === null ? '' : `(${this.voltage})`}`;
    }
    openEditWizard() {
        const wizard = wizards['VoltageLevel'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    /** Opens a [[`WizardDialog`]] for editing `LNode` connections. */
    openLNodeWizard() {
        const wizard = wizards['LNode'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    remove() {
        if (this.element)
            this.dispatchEvent(newActionEvent({
                old: {
                    parent: this.element.parentElement,
                    element: this.element,
                    reference: this.element.nextSibling,
                },
            }));
    }
    openCreateWizard(tagName) {
        const wizard = wizards[tagName].create(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    firstUpdated() {
        this.addMenu.anchor = this.addButton;
    }
    renderIedContainer() {
        const ieds = this.getAttachedIeds?.(this.element) ?? [];
        return ieds?.length
            ? html `<div id="iedcontainer">
          ${ieds.map(ied => html `<ied-editor .element=${ied}></ied-editor>`)}
        </div>`
            : html ``;
    }
    renderAddButtons() {
        return childTags(this.element).map(child => html `<mwc-list-item value="${child}"
          ><span>${child}</span></mwc-list-item
        >`);
    }
    render() {
        return html `<action-pane label="${this.header}">
      <abbr slot="action" title="${translate('lnode.tooltip')}">
        <mwc-icon-button
          icon="account_tree"
          @click=${() => this.openLNodeWizard()}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate('duplicate')}">
        <mwc-icon-button
          icon="content_copy"
          @click=${() => cloneSubstationElement(this)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate('edit')}">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate('move')}">
        <mwc-icon-button
          icon="forward"
          @click=${() => startMove(this, VoltageLevelEditor_1, SubstationEditor)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate('remove')}">
        <mwc-icon-button
          icon="delete"
          @click=${() => this.remove()}
        ></mwc-icon-button>
      </abbr>
      <abbr
        slot="action"
        style="position:relative;"
        title="${translate('add')}"
      >
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => (this.addMenu.open = true)}
        ></mwc-icon-button
        ><mwc-menu
          corner="BOTTOM_RIGHT"
          menuCorner="END"
          @selected=${(e) => {
            const tagName = e.target.selected.value;
            this.openCreateWizard(tagName);
        }}
          >${this.renderAddButtons()}</mwc-menu
        >
      </abbr>
      ${this.renderIedContainer()}
      <div id="bayContainer">
        ${Array.from(this.element?.querySelectorAll(selectors.Bay) ?? []).map(bay => html `<bay-editor
            .element=${bay}
            .getAttachedIeds=${this.getAttachedIeds}
            ?readonly=${this.readonly}
          ></bay-editor>`)}
      </div>
    </action-pane>`;
    }
};
VoltageLevelEditor.styles = css `
    ${styles}

    #bayContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #bayContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
__decorate([
    property({ attribute: false })
], VoltageLevelEditor.prototype, "element", void 0);
__decorate([
    property({ type: Boolean })
], VoltageLevelEditor.prototype, "readonly", void 0);
__decorate([
    property()
], VoltageLevelEditor.prototype, "voltage", null);
__decorate([
    property({ type: String })
], VoltageLevelEditor.prototype, "header", null);
__decorate([
    property({ attribute: false })
], VoltageLevelEditor.prototype, "getAttachedIeds", void 0);
__decorate([
    query('mwc-menu')
], VoltageLevelEditor.prototype, "addMenu", void 0);
__decorate([
    query('mwc-icon-button[icon="playlist_add"]')
], VoltageLevelEditor.prototype, "addButton", void 0);
VoltageLevelEditor = VoltageLevelEditor_1 = __decorate([
    customElement('voltage-level-editor')
], VoltageLevelEditor);
export { VoltageLevelEditor };
//# sourceMappingURL=voltage-level-editor.js.map