var VoltageLevelEditor_1;
import { __decorate } from "../../../../web_modules/tslib.js";
import { LitElement, customElement, html, property, query, css, } from '../../../../web_modules/lit-element.js';
import { translate, get } from '../../../../web_modules/lit-translate.js';
import { newWizardEvent, newActionEvent, getValue, getMultiplier, } from '../../foundation.js';
import './bay-editor.js';
import { BayEditor } from './bay-editor.js';
function isVoltageLevelCreateOptions(options) {
    return options.parent !== undefined;
}
const initial = {
    nomFreq: '50',
    numPhases: '3',
    Voltage: '110',
    multiplier: 'k',
};
let VoltageLevelEditor = VoltageLevelEditor_1 = class VoltageLevelEditor extends LitElement {
    get name() {
        return this.element.getAttribute('name') ?? '';
    }
    get desc() {
        return this.element.getAttribute('desc') ?? null;
    }
    get voltage() {
        const V = this.element.querySelector('Voltage');
        if (V === null)
            return null;
        const v = V.textContent ?? '';
        const m = V.getAttribute('multiplier');
        const u = m === null ? 'V' : ' ' + m + 'V';
        return v ? v + u : null;
    }
    openEditWizard() {
        this.dispatchEvent(newWizardEvent(VoltageLevelEditor_1.wizard({ element: this.element })));
    }
    openBayWizard() {
        if (!this.element)
            return;
        const event = newWizardEvent(BayEditor.wizard({ parent: this.element }));
        this.dispatchEvent(event);
    }
    removeAction() {
        if (this.element)
            this.dispatchEvent(newActionEvent({
                old: { parent: this.parent, element: this.element, reference: null },
            }));
    }
    renderHeader() {
        return html `<div id="header">
      <h2>
        ${this.name} ${this.desc === null ? '' : html `&mdash;`} ${this.desc}
        ${this.voltage === null ? '' : html `(${this.voltage})`}
      </h2>
      <div id="header-icon">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="delete"
          @click=${() => this.removeAction()}
        ></mwc-icon-button>
        <span style="position:relative;float:right;">&vert;</span>
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.openBayWizard()}
        ></mwc-icon-button>
      </div>
    </div>`;
    }
    render() {
        return html `<div id="conainer">
      ${this.renderHeader()}
      <div id="voltageLevelContainer">
        ${Array.from(this.element?.querySelectorAll('Bay') ?? []).map(bay => html `<bay-editor
              .element=${bay}
              .parent=${this.element}
            ></bay-editor>`)}
      </div>
    </div>`;
    }
    static createAction(parent) {
        return (inputs, wizard) => {
            const name = getValue(inputs.find(i => i.label === 'name'));
            const desc = getValue(inputs.find(i => i.label === 'desc'));
            const nomFreq = getValue(inputs.find(i => i.label === 'nomFreq'));
            const numPhases = getValue(inputs.find(i => i.label === 'numPhases'));
            const Voltage = getValue(inputs.find(i => i.label === 'Voltage'));
            const multiplier = getMultiplier(inputs.find(i => i.label === 'Voltage'));
            const action = {
                new: {
                    parent,
                    element: new DOMParser().parseFromString(`<VoltageLevel
              name="${name}"
              ${desc === null ? '' : `desc="${desc}"`}
              ${nomFreq === null ? '' : `nomFreq="${nomFreq}"`}
              ${numPhases === null ? '' : `numPhases="${numPhases}"`}
            >${Voltage === null
                        ? ''
                        : `<Voltage unit="V" ${multiplier === null ? '' : `multiplier="${multiplier}"`}
            >${Voltage}</Voltage>`}</VoltageLevel>`, 'application/xml').documentElement,
                    reference: null,
                },
            };
            wizard.close();
            return [action];
        };
    }
    static updateAction(element) {
        return (inputs, wizard) => {
            const name = inputs.find(i => i.label === 'name').value;
            const desc = getValue(inputs.find(i => i.label === 'desc'));
            const nomFreq = getValue(inputs.find(i => i.label === 'nomFreq'));
            const numPhases = getValue(inputs.find(i => i.label === 'numPhases'));
            const Voltage = getValue(inputs.find(i => i.label === 'Voltage'));
            const multiplier = getMultiplier(inputs.find(i => i.label === 'Voltage'));
            let voltageLevelAction;
            let voltageAction;
            if (name === element.getAttribute('name') &&
                desc === element.getAttribute('desc') &&
                nomFreq === element.getAttribute('nomFreq') &&
                numPhases === element.getAttribute('numPhases')) {
                voltageLevelAction = null;
            }
            else {
                const newElement = element.cloneNode(false);
                newElement.setAttribute('name', name);
                if (desc === null)
                    newElement.removeAttribute('desc');
                else
                    newElement.setAttribute('desc', desc);
                if (nomFreq === null)
                    newElement.removeAttribute('nomFreq');
                else
                    newElement.setAttribute('nomFreq', nomFreq);
                if (numPhases === null)
                    newElement.removeAttribute('numPhases');
                else
                    newElement.setAttribute('numPhases', numPhases);
                voltageLevelAction = { old: { element }, new: { element: newElement } };
            }
            if (Voltage ===
                (element.querySelector('Voltage')?.textContent?.trim() ?? null) &&
                multiplier ===
                    (element.querySelector('Voltage')?.getAttribute('multiplier') ?? null)) {
                voltageAction = null;
            }
            else {
                const oldVoltage = element.querySelector('Voltage');
                if (oldVoltage === null) {
                    const newVoltage = new DOMParser().parseFromString('<Voltage unit="V"></Voltage>', 'application/xml').documentElement;
                    newVoltage.textContent = Voltage;
                    if (multiplier !== null)
                        newVoltage.setAttribute('multiplier', multiplier);
                    voltageAction = {
                        new: {
                            parent: voltageLevelAction?.new.element ?? element,
                            element: newVoltage,
                            reference: element.firstElementChild,
                        },
                    };
                }
                else {
                    if (Voltage === null)
                        voltageAction = {
                            old: {
                                parent: voltageLevelAction?.new.element ?? element,
                                element: oldVoltage,
                                reference: oldVoltage.nextElementSibling,
                            },
                        };
                    else {
                        const newVoltage = oldVoltage.cloneNode(false);
                        newVoltage.textContent = Voltage;
                        if (multiplier === null)
                            newVoltage.removeAttribute('multiplier');
                        else
                            newVoltage.setAttribute('multiplier', multiplier);
                        voltageAction = {
                            old: { element: oldVoltage },
                            new: { element: newVoltage },
                        };
                    }
                }
            }
            if (voltageLevelAction || voltageAction)
                wizard.close();
            const actions = [];
            if (voltageLevelAction)
                actions.push(voltageLevelAction);
            if (voltageAction)
                actions.push(voltageAction);
            return actions;
        };
    }
    static wizard(options) {
        const [heading, actionName, actionIcon, action,] = isVoltageLevelCreateOptions(options)
            ? [
                get('voltagelevel.wizard.title.add'),
                get('add'),
                'add',
                VoltageLevelEditor_1.createAction(options.parent),
            ]
            : [
                get('voltagelevel.wizard.title.edit'),
                get('save'),
                'edit',
                VoltageLevelEditor_1.updateAction(options.element),
            ];
        const [name, desc, nomFreq, numPhases, Voltage, multiplier,] = isVoltageLevelCreateOptions(options)
            ? [
                '',
                null,
                initial.nomFreq,
                initial.numPhases,
                initial.Voltage,
                initial.multiplier,
            ]
            : [
                options.element.getAttribute('name'),
                options.element.getAttribute('desc'),
                options.element.getAttribute('nomFreq'),
                options.element.getAttribute('numPhases'),
                options.element.querySelector('Voltage')?.textContent?.trim() ?? null,
                options.element
                    .querySelector('Voltage')
                    ?.getAttribute('multiplier') ?? null,
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
            helper="${translate('voltagelevel.wizard.nameHelper')}"
            iconTrailing="title"
            required
            validationMessage="${translate('textfield.required')}"
            dialogInitialFocus
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="desc"
            .maybeValue=${desc}
            nullable="true"
            helper="${translate('voltagelevel.wizard.descHelper')}"
            iconTrailing="description"
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="nomFreq"
            .maybeValue=${nomFreq}
            nullable="true"
            helper="${translate('voltagelevel.wizard.nomFreqHelper')}"
            suffix="Hz"
            required
            validationMessage="${translate('textfield.nonempty')}"
            pattern="[0-9]*[.]?[0-9]+"
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="numPhases"
            .maybeValue=${numPhases}
            nullable="true"
            helper="${translate('voltagelevel.wizard.numPhaseHelper')}"
            suffix="#"
            required
            validationMessage="${translate('textfield.nonempty')}"
            type="number"
            min="1"
            max="255"
          ></wizard-textfield>`,
                    html `<wizard-textfield
            label="Voltage"
            .maybeValue=${Voltage}
            nullable
            unit="V"
            .multipliers=${[null, 'G', 'M', 'k', '', 'm']}
            .multiplier=${multiplier}
            helper="${translate('voltagelevel.wizard.voltageHelper')}"
            required
            validationMessage="${translate('textfield.nonempty')}"
            pattern="[0-9]*[.]?[0-9]+"
          ></wizard-textfield>`,
                ],
            },
        ];
    }
};
VoltageLevelEditor.styles = css `
    #conainer {
      background-color: var(--mdc-theme-on-primary);
      color: var(--mdc-theme-on-surface);
      margin: 10px;
    }

    #header {
      display: flex;
    }

    #header-icon {
      display: flex;
      align-items: center;
    }

    h2 {
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: auto;
      padding-left: 0.5em;
    }

    #voltageLevelContainer {
      display: flex;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
    }

    svg {
      width: 25px;
      height: 25px;
      position: relative;
      padding: 5px;
    }
  `;
__decorate([
    property()
], VoltageLevelEditor.prototype, "parent", void 0);
__decorate([
    property()
], VoltageLevelEditor.prototype, "element", void 0);
__decorate([
    property()
], VoltageLevelEditor.prototype, "name", null);
__decorate([
    property()
], VoltageLevelEditor.prototype, "desc", null);
__decorate([
    property()
], VoltageLevelEditor.prototype, "voltage", null);
__decorate([
    query('h2')
], VoltageLevelEditor.prototype, "header", void 0);
VoltageLevelEditor = VoltageLevelEditor_1 = __decorate([
    customElement('voltage-level-editor')
], VoltageLevelEditor);
export { VoltageLevelEditor };
//# sourceMappingURL=voltage-level-editor.js.map