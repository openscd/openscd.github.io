import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { LitElement, html, property, css } from '../../../_snowpack/pkg/lit-element.js';
import { translate, get } from '../../../_snowpack/pkg/lit-translate.js';
import { newWizardEvent } from '../foundation.js';
import { selectors, styles } from './substation/foundation.js';
import './substation/substation-editor.js';
import { SubstationEditor } from './substation/substation-editor.js';
/** An editor [[`plugin`]] for editing the `Substation` section. */
export default class SubstationPlugin extends LitElement {
    /** Opens a [[`WizardDialog`]] for creating a new `Substation` element. */
    openCreateSubstationWizard() {
        this.dispatchEvent(newWizardEvent(SubstationEditor.wizard({ parent: this.doc.documentElement })));
    }
    render() {
        if (!this.doc?.querySelector(selectors.Substation))
            return html `<h1>
        <span style="color: var(--base1)"
          >${translate('substation.missing')}</span
        >
        <mwc-fab
          extended
          icon="add"
          label="${get('substation.wizard.title.add')}"
          @click=${() => this.openCreateSubstationWizard()}
        ></mwc-fab>
      </h1>`;
        return html `
      ${Array.from(this.doc.querySelectorAll(selectors.Substation) ?? []).map(substation => html `<substation-editor .element=${substation}></substation-editor>`)}
    `;
    }
}
SubstationPlugin.styles = css `
    ${styles}

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
    property()
], SubstationPlugin.prototype, "doc", void 0);
//# sourceMappingURL=Substation.js.map