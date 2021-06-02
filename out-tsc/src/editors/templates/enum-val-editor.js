var EnumValEditor_1;
import { __decorate } from "../../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, } from '../../../../_snowpack/pkg/lit-element.js';
import { translate, get } from '../../../../_snowpack/pkg/lit-translate.js';
import { createElement, getReference, getValue, newActionEvent, newWizardEvent, patterns, } from '../../foundation.js';
import { isCreateOptions, styles, } from '../substation/foundation.js';
function nextOrd(parent) {
    const maxOrd = Math.max(...Array.from(parent.children).map(child => parseInt(child.getAttribute('ord') ?? '-2', 10)));
    return isFinite(maxOrd) ? (maxOrd + 1).toString(10) : '0';
}
/** [[`Templates`]] plugin subeditor for editing `EnumVal`s. */
let EnumValEditor = EnumValEditor_1 = class EnumValEditor extends LitElement {
    /** [[element | `element.ord`]] */
    get ord() {
        return this.element.getAttribute('ord') ?? '-1';
    }
    /** [[element | `element.desc`]] */
    get desc() {
        return this.element.getAttribute('desc');
    }
    /** [[element | `element.textContent` ]] */
    get value() {
        return this.element.textContent ?? '';
    }
    /** Opens a [[`WizardDialog`]] for editing [[`element`]]. */
    openEditWizard() {
        this.dispatchEvent(newWizardEvent(EnumValEditor_1.wizard({ element: this.element }), {
            detail: { subwizard: true },
        }));
    }
    render() {
        return html `<mwc-list-item
      @click=${() => this.openEditWizard()}
      graphic="icon"
      hasMeta
      tabindex="0"
    >
      <span>${this.value}</span>
      <span slot="graphic">${this.ord}</span>
      <mwc-icon slot="meta">edit</mwc-icon>
    </mwc-list-item>`;
    }
    static createAction(parent) {
        return (inputs) => {
            const value = getValue(inputs.find(i => i.label === 'value'));
            const desc = getValue(inputs.find(i => i.label === 'desc'));
            const ord = getValue(inputs.find(i => i.label === 'ord')) || nextOrd(parent);
            const element = createElement(parent.ownerDocument, 'EnumVal', {
                ord,
                desc,
            });
            element.textContent = value;
            const action = {
                new: {
                    parent,
                    element,
                    reference: getReference(parent, 'EnumVal'),
                },
            };
            return [action];
        };
    }
    static updateAction(element) {
        return (inputs) => {
            const value = getValue(inputs.find(i => i.label === 'value')) ?? '';
            const desc = getValue(inputs.find(i => i.label === 'desc'));
            const ord = getValue(inputs.find(i => i.label === 'ord')) ||
                element.getAttribute('ord') ||
                nextOrd(element.parentElement);
            if (value === element.textContent &&
                desc === element.getAttribute('desc') &&
                ord === element.getAttribute('ord'))
                return [];
            const newElement = element.cloneNode(false);
            if (desc === null)
                newElement.removeAttribute('desc');
            else
                newElement.setAttribute('desc', desc);
            newElement.setAttribute('ord', ord);
            newElement.textContent = value;
            return [{ old: { element }, new: { element: newElement } }];
        };
    }
    static wizard(options) {
        const [heading, actionName, actionIcon, action, ord, desc, value,] = isCreateOptions(options)
            ? [
                get('enum-val.wizard.title.add'),
                get('add'),
                'add',
                EnumValEditor_1.createAction(options.parent),
                nextOrd(options.parent),
                null,
                '',
            ]
            : [
                get('enum-val.wizard.title.edit'),
                get('save'),
                'edit',
                EnumValEditor_1.updateAction(options.element),
                options.element.getAttribute('ord'),
                options.element.getAttribute('desc'),
                options.element.textContent,
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
                    isCreateOptions(options)
                        ? html ``
                        : html `<mwc-button
                icon="delete"
                trailingIcon
                label=${translate('delete')}
                @click=${(e) => {
                            e.target.dispatchEvent(newWizardEvent());
                            e.target.dispatchEvent(newActionEvent({
                                old: {
                                    parent: options.element.parentElement,
                                    element: options.element,
                                    reference: options.element.nextElementSibling,
                                },
                            }));
                        }}
                fullwidth
              ></mwc-button>`,
                    html `<wizard-textfield
            label="ord"
            helper="${translate('scl.ord')}"
            .maybeValue=${ord}
            required
            type="number"
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="value"
            helper="${translate('scl.value')}"
            .maybeValue=${value}
            pattern="${patterns.normalizedString}"
            dialogInitialFocus
          ></wizard-textfield>`,
                    html `<wizard-textfield
            id="evDesc"
            label="desc"
            helper="${translate('scl.desc')}"
            .maybeValue=${desc}
            nullable
            pattern="${patterns.normalizedString}"
          ></wizard-textfield>`,
                ],
            },
        ];
    }
};
EnumValEditor.styles = css `
    ${styles}

    section {
      overflow: auto;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
    property()
], EnumValEditor.prototype, "element", void 0);
__decorate([
    property({ type: Number })
], EnumValEditor.prototype, "ord", null);
__decorate([
    property({ type: String })
], EnumValEditor.prototype, "desc", null);
__decorate([
    property({ type: String })
], EnumValEditor.prototype, "value", null);
EnumValEditor = EnumValEditor_1 = __decorate([
    customElement('enum-val-editor')
], EnumValEditor);
export { EnumValEditor };
//# sourceMappingURL=enum-val-editor.js.map