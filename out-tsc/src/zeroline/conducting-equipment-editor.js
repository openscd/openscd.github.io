var ConductingEquipmentEditor_1;
import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, } from '../../../_snowpack/pkg/lit-element.js';
import { startMove, getIcon } from './foundation.js';
import { newActionEvent, newWizardEvent } from '../foundation.js';
import { BayEditor } from './bay-editor.js';
import { wizards } from '../wizards/wizard-library.js';
/** [[`SubstationEditor`]] subeditor for a `ConductingEquipment` element. */
let ConductingEquipmentEditor = ConductingEquipmentEditor_1 = class ConductingEquipmentEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
    }
    get name() {
        return this.element.getAttribute('name') ?? '';
    }
    openEditWizard() {
        const wizard = wizards['ConductingEquipment'].edit(this.element);
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
    render() {
        return html `
      <div id="container" tabindex="0">
        ${getIcon(this.element)}
        ${this.readonly
            ? html ``
            : html `<mwc-fab
                mini
                class="menu-item left"
                @click="${() => this.openLNodeWizard()}"
                icon="account_tree"
              ></mwc-fab>
              <mwc-fab
                mini
                class="menu-item up"
                icon="edit"
                @click="${() => this.openEditWizard()}}"
              ></mwc-fab>
              <mwc-fab
                mini
                class="menu-item right"
                @click="${() => startMove(this, ConductingEquipmentEditor_1, BayEditor)}"
                icon="forward"
              ></mwc-fab>
              <mwc-fab
                mini
                class="menu-item down"
                icon="delete"
                @click="${() => this.remove()}}"
              ></mwc-fab>`}
      </div>
      <h4>${this.name}</h4>
    `;
    }
};
ConductingEquipmentEditor.styles = css `
    #container {
      color: var(--mdc-theme-on-surface);
      width: 64px;
      height: 64px;
      margin: auto;
      position: relative;
      transition: all 200ms linear;
    }

    #container:focus {
      outline: none;
    }

    #container > svg {
      color: var(--mdc-theme-on-surface);
      width: 64px;
      height: 64px;
      transition: transform 150ms linear, box-shadow 200ms linear;
      outline-color: var(--mdc-theme-primary);
      outline-style: solid;
      outline-width: 0px;
    }

    #container:focus > svg {
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
    }

    #container:hover > svg {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    #container:focus-within > svg {
      outline: 2px solid var(--mdc-theme-primary);
      background: var(--mdc-theme-on-primary);
      transform: scale(0.8);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    .menu-item {
      color: var(--mdc-theme-on-surface);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 200ms linear;
      position: absolute;
      top: 8px;
      left: 8px;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
    }

    #container:focus-within > .menu-item {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 250ms linear;
      pointer-events: auto;
      opacity: 1;
    }

    #container:focus-within > .menu-item.up {
      transform: translate(0px, -52px);
    }

    #container:focus-within > .menu-item.down {
      transform: translate(0px, 52px);
    }

    #container:focus-within > .menu-item.right {
      transform: translate(52px, 0px);
    }

    #container:focus-within > .menu-item.left {
      transform: translate(-52px, 0px);
    }

    h4 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      opacity: 1;
      transition: opacity 200ms linear;
      text-align: center;
    }

    :host(.moving) #container,
    :host(.moving) h4 {
      opacity: 0.3;
    }
  `;
__decorate([
    property({ type: Element })
], ConductingEquipmentEditor.prototype, "element", void 0);
__decorate([
    property({ type: Boolean })
], ConductingEquipmentEditor.prototype, "readonly", void 0);
__decorate([
    property({ type: String })
], ConductingEquipmentEditor.prototype, "name", null);
ConductingEquipmentEditor = ConductingEquipmentEditor_1 = __decorate([
    customElement('conducting-equipment-editor')
], ConductingEquipmentEditor);
export { ConductingEquipmentEditor };
//# sourceMappingURL=conducting-equipment-editor.js.map