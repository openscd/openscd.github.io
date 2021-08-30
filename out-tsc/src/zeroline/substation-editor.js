var SubstationEditor_1;
import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, } from '../../../_snowpack/pkg/lit-element.js';
import { translate } from '../../../_snowpack/pkg/lit-translate.js';
import { newActionEvent, newWizardEvent } from '../foundation.js';
import { wizards } from '../wizards/wizard-library.js';
import { cloneSubstationElement, selectors, startMove, styles, } from './foundation.js';
import './voltage-level-editor.js';
/** [[`Substation`]] plugin subeditor for editing `Substation` sections. */
let SubstationEditor = SubstationEditor_1 = class SubstationEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.getAttachedIeds = () => {
            return [];
        };
    }
    /** [[element | `element.name`]] */
    get name() {
        return this.element.getAttribute('name') ?? '';
    }
    /** [[element | `element.desc`]] */
    get desc() {
        return this.element.getAttribute('desc');
    }
    /** Opens a [[`WizardDialog`]] for editing [[`element`]]. */
    openEditWizard() {
        const wizard = wizards['Substation'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    /** Opens a [[`WizardDialog`]] for adding a new `VoltageLevel`. */
    openVoltageLevelWizard() {
        const wizard = wizards['VoltageLevel'].create(this.element);
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
    renderIedContainer() {
        const ieds = this.getAttachedIeds?.(this.element) ?? [];
        return ieds?.length
            ? html `<div id="iedcontainer">
          ${ieds.map(ied => html `<ied-editor .element=${ied}></ied-editor>`)}
        </div>`
            : html ``;
    }
    renderHeader() {
        return html `
        <h1>
          ${this.name} ${this.desc === null ? '' : html `&mdash;`} ${this.desc}
          ${this.readonly
            ? html ``
            : html `<abbr title="${translate('add')}">
                    <mwc-icon-button
                      icon="playlist_add"
                      @click=${() => this.openVoltageLevelWizard()}
                    ></mwc-icon-button>
                  </abbr>
                  <nav>
                    <abbr title="${translate('lnode.tooltip')}">
                      <mwc-icon-button
                        icon="account_tree"
                        @click=${() => this.openLNodeWizard()}
                      ></mwc-icon-button>
                    </abbr>
                    <abbr title="${translate('duplicate')}">
                      <mwc-icon-button
                        icon="content_copy"
                        @click=${() => cloneSubstationElement(this)}
                      ></mwc-icon-button>
                    </abbr>
                    <abbr title="${translate('edit')}">
                      <mwc-icon-button
                        icon="edit"
                        @click=${() => this.openEditWizard()}
                      ></mwc-icon-button>
                    </abbr>
                    <abbr title="${translate('move')}">
                      <mwc-icon-button
                        icon="forward"
                        @click=${() => startMove(this, SubstationEditor_1, SubstationEditor_1)}
                      ></mwc-icon-button>
                    </abbr>
                    <abbr title="${translate('remove')}">
                      <mwc-icon-button
                        icon="delete"
                        @click=${() => this.remove()}
                      ></mwc-icon-button>
                    </abbr>
                  </nav>`}
          </nav>
        </h1>
      `;
    }
    render() {
        return html `
      <section tabindex="0">
        ${this.renderHeader()} ${this.renderIedContainer()}
        ${Array.from(this.element.querySelectorAll(selectors.VoltageLevel)).map(voltageLevel => html `<voltage-level-editor
              .element=${voltageLevel}
              .getAttachedIeds=${this.getAttachedIeds}
              ?readonly=${this.readonly}
            ></voltage-level-editor>`)}
      </section>
    `;
    }
};
SubstationEditor.styles = css `
    ${styles}

    section {
      overflow: hidden;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
    property({ attribute: false })
], SubstationEditor.prototype, "element", void 0);
__decorate([
    property({ type: Boolean })
], SubstationEditor.prototype, "readonly", void 0);
__decorate([
    property({ type: String })
], SubstationEditor.prototype, "name", null);
__decorate([
    property({ type: String })
], SubstationEditor.prototype, "desc", null);
__decorate([
    property({ attribute: false })
], SubstationEditor.prototype, "getAttachedIeds", void 0);
SubstationEditor = SubstationEditor_1 = __decorate([
    customElement('substation-editor')
], SubstationEditor);
export { SubstationEditor };
//# sourceMappingURL=substation-editor.js.map