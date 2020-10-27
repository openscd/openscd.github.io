import { __decorate } from "../../../web_modules/tslib.js";
import { LitElement, html, property, css } from '../../../web_modules/lit-element.js';
import { translate, get } from '../../../web_modules/lit-translate.js';
import '../../../web_modules/@material/mwc-button.js';
import '../../../web_modules/@material/mwc-fab.js';
import '../../../web_modules/@material/mwc-icon-button.js';
import '../../../web_modules/@material/mwc-list/mwc-list-item.js';
import { newActionEvent, newWizardEvent, getValue, } from '../foundation.js';
import './substation/voltage-level-editor.js';
import { VoltageLevelEditor } from './substation/voltage-level-editor.js';
export default class SubstationEditor extends LitElement {
    constructor() {
        super();
        this.substationEditAction = this.substationEditAction.bind(this);
    }
    get element() {
        return this.doc?.querySelector('Substation') ?? null;
    }
    get parent() {
        return this.doc.documentElement; // <SCL>
    }
    get name() {
        return this.element?.getAttribute('name') ?? '';
    }
    get desc() {
        return this.element?.getAttribute('desc') ?? null;
    }
    newUpdateAction(name, desc) {
        if (!this.element)
            throw new Error('Cannot edit a missing Substation');
        const newElement = this.element.cloneNode(false);
        newElement.setAttribute('name', name);
        if (desc === null)
            newElement.removeAttribute('desc');
        else
            newElement.setAttribute('desc', desc);
        return {
            old: { element: this.element },
            new: { element: newElement },
        };
    }
    newCreateAction(name, desc) {
        if (this.element)
            throw new Error('Will not create a second Substation');
        return {
            new: {
                parent: this.parent,
                element: new DOMParser().parseFromString(`<Substation name="${name}"${desc === null ? '' : ` desc="${desc}"`}></Substation>`, 'application/xml').documentElement,
                reference: null,
            },
        };
    }
    substationEditAction(inputs, dialog) {
        const name = inputs.find(i => i.label === 'name').value;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        if (name === this.name && desc === this.desc)
            return [];
        const action = this.element
            ? this.newUpdateAction(name, desc)
            : this.newCreateAction(name, desc);
        dialog.close();
        return [action];
    }
    openVoltageLevelWizard() {
        if (!this.element)
            return;
        const event = newWizardEvent(VoltageLevelEditor.wizard({ parent: this.element }));
        this.dispatchEvent(event);
    }
    openSubstationWizard() {
        const [heading, actionName, actionIcon] = this.element
            ? [get('substation.wizard.title.edit'), get('edit'), 'edit']
            : [get('substation.wizard.title.add'), get('add'), 'add'];
        const event = newWizardEvent([
            {
                title: heading,
                primary: {
                    icon: actionIcon,
                    action: this.substationEditAction,
                    label: actionName,
                },
                content: [
                    html `<wizard-textfield
            .maybeValue=${this.name}
            helper="${translate('substation.wizard.nameHelper')}"
            label="name"
            required
            dialogInitialFocus
          ></wizard-textfield>`,
                    html `<wizard-textfield
            .maybeValue=${this.desc}
            helper="${translate('substation.wizard.descHelper')}"
            label="desc"
            nullable
          ></wizard-textfield>`,
                ],
            },
        ]);
        this.dispatchEvent(event);
    }
    removeSubstation() {
        if (this.element)
            this.dispatchEvent(newActionEvent({
                old: { parent: this.parent, element: this.element, reference: null },
            }));
    }
    renderHeader() {
        if (!this.element)
            return html `<h1>
        <span style="color: var(--base1)"
          >${translate('substation.missing')}</span
        >
        <mwc-icon-button
          icon="add"
          @click=${() => this.openSubstationWizard()}
        ></mwc-icon-button>
      </h1>`;
        return html `
      <h1>
        <mwc-icon-button
          icon="playlist_add"
          @click=${() => this.openVoltageLevelWizard()}
        ></mwc-icon-button>
        <span style="position:relative; float:right;">&#124;</span>
        <mwc-icon-button
          icon="delete"
          @click=${() => this.removeSubstation()}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openSubstationWizard()}
        ></mwc-icon-button>
        ${this.name} ${this.desc === null ? '' : html `&mdash;`} ${this.desc}
      </h1>
    `;
    }
    render() {
        return html `
      <div id="container">
        ${this.renderHeader()}
        ${Array.from(this.element?.querySelectorAll('VoltageLevel') ?? []).map(voltageLevel => html `<voltage-level-editor
              .element=${voltageLevel}
              .parent=${this.element}
            ></voltage-level-editor>`)}
        <mwc-fab
          @click=${this.openSubstationWizard}
          icon="${this.element ? 'edit' : 'add'}"
        >
        </mwc-fab>
      </div>
    `;
    }
}
SubstationEditor.styles = css `
    :host {
      width: calc(100vw);
      overflow-x: hidden;
    }

    #container {
      background-color: var(--mdc-theme-surface);
      margin: 10px;
    }

    h1 {
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      color: var(--mdc-theme-on-surface);
      margin: 0px;
      padding-top: 0.3em;
      padding-bottom: 0.3em;
    }

    h1 > mwc-icon-button {
      position: relative;
      float: right;
      top: -5px;
    }

    mwc-dialog {
      display: flex;
      flex-direction: column;
    }

    mwc-dialog > * {
      display: block;
      margin-top: 16px;
    }

    pre {
      font-family: 'Roboto Mono', monospace;
      font-weight: 100;
    }

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    h1 > svg {
      position: relative;
      widht: 30px;
      height: 30px;
      padding: 6px;
    }
  `;
__decorate([
    property()
], SubstationEditor.prototype, "doc", void 0);
__decorate([
    property()
], SubstationEditor.prototype, "element", null);
__decorate([
    property()
], SubstationEditor.prototype, "parent", null);
__decorate([
    property({ type: String })
], SubstationEditor.prototype, "name", null);
__decorate([
    property({ type: String })
], SubstationEditor.prototype, "desc", null);
//# sourceMappingURL=SubstationEditor.js.map