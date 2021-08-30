var BayEditor_1;
import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, } from '../../../_snowpack/pkg/lit-element.js';
import { translate } from '../../../_snowpack/pkg/lit-translate.js';
import { startMove, styles, cloneSubstationElement } from './foundation.js';
import { newActionEvent, newWizardEvent } from '../foundation.js';
import { wizards } from '../wizards/wizard-library.js';
import { VoltageLevelEditor } from './voltage-level-editor.js';
import './conducting-equipment-editor.js';
/** [[`SubstationEditor`]] subeditor for a `Bay` element. */
let BayEditor = BayEditor_1 = class BayEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.getAttachedIeds = () => {
            return [];
        };
    }
    get name() {
        return this.element.getAttribute('name') ?? '';
    }
    get desc() {
        return this.element.getAttribute('desc') ?? null;
    }
    openEditWizard() {
        const wizard = wizards['Bay'].edit(this.element);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    openConductingEquipmentWizard() {
        const wizard = wizards['ConductingEquipment'].create(this.element);
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
    renderIedContainer() {
        const ieds = this.getAttachedIeds?.(this.element) ?? [];
        return ieds?.length
            ? html `<div id="iedcontainer">
          ${ieds.map(ied => html `<ied-editor .element=${ied}></ied-editor>`)}
        </div>`
            : html ``;
    }
    renderHeader() {
        return html `<h3>
      ${this.name} ${this.desc === null ? '' : html `&mdash;`} ${this.desc}
      ${this.readonly
            ? html ``
            : html `<abbr title="${translate('add')}">
              <mwc-icon-button
                icon="playlist_add"
                @click=${() => this.openConductingEquipmentWizard()}
              ></mwc-icon-button>
            </abbr>
            <nav>
              <abbr title="${translate('lnode.tooltip')}">
                <mwc-icon-button
                  icon="account_tree"
                  @click="${() => this.openLNodeWizard()}"
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
                  @click=${() => startMove(this, BayEditor_1, VoltageLevelEditor)}
                ></mwc-icon-button>
              </abbr>
              <abbr title="${translate('remove')}">
                <mwc-icon-button
                  icon="delete"
                  @click=${() => this.remove()}
                ></mwc-icon-button>
              </abbr>
            </nav>`}
    </h3>`;
    }
    render() {
        return html `<section tabindex="0">
      ${this.renderHeader()}
      <div>
        ${this.renderIedContainer()}
        <div id="ceContainer">
          ${Array.from(this.element?.querySelectorAll(':root > Substation > VoltageLevel > Bay > ConductingEquipment') ?? []).map(voltageLevel => html `<conducting-equipment-editor
                .element=${voltageLevel}
                ?readonly=${this.readonly}
              ></conducting-equipment-editor>`)}
        </div>
      </div>
    </section> `;
    }
};
BayEditor.styles = css `
    ${styles}

    section {
      margin: 0px;
    }

    #ceContainer {
      display: grid;
      grid-gap: 12px;
      padding: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
    property({ attribute: false })
], BayEditor.prototype, "element", void 0);
__decorate([
    property({ type: Boolean })
], BayEditor.prototype, "readonly", void 0);
__decorate([
    property({ type: String })
], BayEditor.prototype, "name", null);
__decorate([
    property({ type: String })
], BayEditor.prototype, "desc", null);
__decorate([
    property({ attribute: false })
], BayEditor.prototype, "getAttachedIeds", void 0);
BayEditor = BayEditor_1 = __decorate([
    customElement('bay-editor')
], BayEditor);
export { BayEditor };
//# sourceMappingURL=bay-editor.js.map