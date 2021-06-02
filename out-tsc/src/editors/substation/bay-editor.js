var BayEditor_1;
import { __decorate } from "../../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, } from '../../../../_snowpack/pkg/lit-element.js';
import { translate, get } from '../../../../_snowpack/pkg/lit-translate.js';
import { createElement, getReference, getValue, newActionEvent, newWizardEvent, } from '../../foundation.js';
import { isCreateOptions, startMove, styles, updateNamingAction, cloneElement, } from './foundation.js';
import './conducting-equipment-editor.js';
import { ConductingEquipmentEditor } from './conducting-equipment-editor.js';
import { editlNode } from './lnodewizard.js';
import { VoltageLevelEditor } from './voltage-level-editor.js';
/** [[`SubstationEditor`]] subeditor for a `Bay` element. */
let BayEditor = BayEditor_1 = class BayEditor extends LitElement {
    get name() {
        return this.element.getAttribute('name') ?? '';
    }
    get desc() {
        return this.element.getAttribute('desc') ?? null;
    }
    openEditWizard() {
        this.dispatchEvent(newWizardEvent(BayEditor_1.wizard({ element: this.element })));
    }
    openConductingEquipmentWizard() {
        if (!this.element)
            return;
        const event = newWizardEvent(ConductingEquipmentEditor.wizard({ parent: this.element }));
        this.dispatchEvent(event);
    }
    openLNodeWizard() {
        this.dispatchEvent(newWizardEvent(editlNode(this.element)));
    }
    remove() {
        if (this.element)
            this.dispatchEvent(newActionEvent({
                old: {
                    parent: this.element.parentElement,
                    element: this.element,
                    reference: this.element.nextElementSibling,
                },
            }));
    }
    renderHeader() {
        return html `<h3>
      ${this.name} ${this.desc === null ? '' : html `&mdash;`} ${this.desc}
      <abbr title="${translate('add')}">
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
            @click=${() => cloneElement(this)}
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
      </nav>
    </h3>`;
    }
    render() {
        return html `<section tabindex="0">
      ${this.renderHeader()}
      <div id="ceContainer">
        ${Array.from(this.element?.querySelectorAll(':root > Substation > VoltageLevel > Bay > ConductingEquipment') ?? []).map(voltageLevel => html `<conducting-equipment-editor
              .element=${voltageLevel}
            ></conducting-equipment-editor>`)}
      </div>
    </section> `;
    }
    static createAction(parent) {
        return (inputs) => {
            const name = getValue(inputs.find(i => i.label === 'name'));
            const desc = getValue(inputs.find(i => i.label === 'desc'));
            const element = createElement(parent.ownerDocument, 'Bay', {
                name,
                desc,
            });
            const action = {
                new: {
                    parent,
                    element,
                    reference: getReference(parent, 'Bay'),
                },
            };
            return [action];
        };
    }
    static wizard(options) {
        const [heading, actionName, actionIcon, action, name, desc,] = isCreateOptions(options)
            ? [
                get('bay.wizard.title.add'),
                get('add'),
                'add',
                BayEditor_1.createAction(options.parent),
                '',
                '',
            ]
            : [
                get('bay.wizard.title.edit'),
                get('save'),
                'edit',
                updateNamingAction(options.element),
                options.element.getAttribute('name'),
                options.element.getAttribute('desc'),
            ];
        return [
            {
                title: heading,
                primary: {
                    icon: actionIcon,
                    label: actionName,
                    action: action,
                },
                content: [
                    html `<wizard-textfield
            label="name"
            .maybeValue=${name}
            helper="${translate('bay.wizard.nameHelper')}"
            required
            validationMessage="${translate('textfield.required')}"
            dialogInitialFocus
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable
            helper="${translate('bay.wizard.descHelper')}"
          ></wizard-textfield>`,
                ],
            },
        ];
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
    property()
], BayEditor.prototype, "element", void 0);
__decorate([
    property({ type: String })
], BayEditor.prototype, "name", null);
__decorate([
    property({ type: String })
], BayEditor.prototype, "desc", null);
BayEditor = BayEditor_1 = __decorate([
    customElement('bay-editor')
], BayEditor);
export { BayEditor };
//# sourceMappingURL=bay-editor.js.map