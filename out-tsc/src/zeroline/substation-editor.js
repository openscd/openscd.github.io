var SubstationEditor_1;
import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, query, } from '../../../_snowpack/pkg/lit-element.js';
import { translate } from '../../../_snowpack/pkg/lit-translate.js';
import { newActionEvent, newWizardEvent, tags } from '../foundation.js';
import { cloneSubstationElement, selectors, startMove, styles, } from './foundation.js';
import { emptyWizard, wizards } from '../wizards/wizard-library.js';
import './voltage-level-editor.js';
import '../action-pane.js';
function childTags(element) {
    if (!element)
        return [];
    return tags[element.tagName].children.filter(child => wizards[child].create !== emptyWizard);
}
/** [[`Substation`]] plugin subeditor for editing `Substation` sections. */
let SubstationEditor = SubstationEditor_1 = class SubstationEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.getAttachedIeds = () => {
            return [];
        };
    }
    get header() {
        const name = this.element.getAttribute('name') ?? '';
        const desc = this.element.getAttribute('desc');
        return `${name} ${desc ? `- ${desc}` : ''}`;
    }
    /** Opens a [[`WizardDialog`]] for editing [[`element`]]. */
    openEditWizard() {
        const wizard = wizards['Substation'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    /** Opens a [[`WizardDialog`]] for editing `LNode` connections. */
    openLNodeWizard() {
        const wizard = wizards['LNode'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    /** Deletes [[`element`]]. */
    remove() {
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
          @click=${() => startMove(this, SubstationEditor_1, SubstationEditor_1)}
        ></mwc-icon-button>
      </abbr>
      <abbr slot="action" title="${translate('remove')}">
        <mwc-icon-button
          icon="delete"
          @click=${() => this.remove()}
        ></mwc-icon-button
      ></abbr>
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
      ${Array.from(this.element.querySelectorAll(selectors.VoltageLevel)).map(voltageLevel => html `<voltage-level-editor
            .element=${voltageLevel}
            .getAttachedIeds=${this.getAttachedIeds}
            ?readonly=${this.readonly}
          ></voltage-level-editor>`)}</action-pane
    >`;
    }
};
SubstationEditor.styles = css `
    ${styles}
  `;
__decorate([
    property({ attribute: false })
], SubstationEditor.prototype, "element", void 0);
__decorate([
    property({ type: Boolean })
], SubstationEditor.prototype, "readonly", void 0);
__decorate([
    property({ type: String })
], SubstationEditor.prototype, "header", null);
__decorate([
    property({ attribute: false })
], SubstationEditor.prototype, "getAttachedIeds", void 0);
__decorate([
    query('mwc-menu')
], SubstationEditor.prototype, "addMenu", void 0);
__decorate([
    query('mwc-icon-button[icon="playlist_add"]')
], SubstationEditor.prototype, "addButton", void 0);
SubstationEditor = SubstationEditor_1 = __decorate([
    customElement('substation-editor')
], SubstationEditor);
export { SubstationEditor };
//# sourceMappingURL=substation-editor.js.map