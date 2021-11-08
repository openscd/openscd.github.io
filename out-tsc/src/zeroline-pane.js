import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { LitElement, html, property, customElement, css, query, } from '../../_snowpack/pkg/lit-element.js';
import { translate } from '../../_snowpack/pkg/lit-translate.js';
import { isPublic, newWizardEvent } from './foundation.js';
import { getAttachedIeds } from './zeroline/foundation.js';
import './zeroline/substation-editor.js';
import './zeroline/ied-editor.js';
import { wizards } from './wizards/wizard-library.js';
import { communicationMappingWizard } from './wizards/commmap-wizards.js';
import { selectGseControlWizard } from './wizards/gsecontrol.js';
import { gooseIcon } from './icons.js';
function shouldShowIEDs() {
    return localStorage.getItem('showieds') === 'on';
}
function setShowIEDs(value) {
    localStorage.setItem('showieds', value);
}
/** [[`Zeroline`]] pane for displaying `Substation` and/or `IED` sections. */
let ZerolinePane = class ZerolinePane extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.getAttachedIeds = () => [];
    }
    openCommunicationMapping() {
        const wizard = communicationMappingWizard(this.doc);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    /** Opens a [[`WizardDialog`]] for creating a new `Substation` element. */
    openCreateSubstationWizard() {
        const wizard = wizards['Substation'].create(this.doc.documentElement);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    openGseControlSelection() {
        const wizard = selectGseControlWizard(this.doc.documentElement);
        if (wizard)
            this.dispatchEvent(newWizardEvent(wizard));
    }
    toggleShowIEDs() {
        if (shouldShowIEDs())
            setShowIEDs('off');
        else
            setShowIEDs('on');
        this.requestUpdate();
    }
    renderIedContainer() {
        this.getAttachedIeds = shouldShowIEDs()
            ? getAttachedIeds(this.doc)
            : () => [];
        const ieds = this.getAttachedIeds?.(this.doc.documentElement) ?? [];
        return ieds.length
            ? html `<div id="iedcontainer">
          ${ieds.map(ied => html `<ied-editor .element=${ied}></ied-editor>`)}
        </div>`
            : html ``;
    }
    render() {
        return html ` <h1>
        <nav>
          <abbr title="${translate('add')}">
            <mwc-icon-button
              id="createsubstation"
              icon="playlist_add"
              @click=${() => this.openCreateSubstationWizard()}
            ></mwc-icon-button>
          </abbr>
        </nav>
        <nav>
          <abbr title="${translate('zeroline.commmap')}">
            <mwc-icon-button-toggle
              ?on=${shouldShowIEDs()}
              @click=${() => this.toggleShowIEDs()}
              id="showieds"
              onIcon="developer_board"
              offIcon="developer_board_off"
            ></mwc-icon-button-toggle>
          </abbr>
          <abbr title="${translate('zeroline.commmap')}">
            <mwc-icon-button
              id="commmap"
              icon="link"
              @click=${() => this.openCommunicationMapping()}
            ></mwc-icon-button>
          </abbr>
          <abbr title="${translate('zeroline.gsecontrol')}"
            ><mwc-icon-button
              id="gsecontrol"
              @click="${() => this.openGseControlSelection()}"
              >${gooseIcon}</mwc-icon-button
            ></abbr
          >
        </nav>
      </h1>
      ${this.renderIedContainer()}
      ${this.doc?.querySelector(':root > Substation')
            ? html `<section>
            ${Array.from(this.doc.querySelectorAll('Substation') ?? [])
                .filter(isPublic)
                .map(substation => html `<substation-editor
                    .element=${substation}
                    .getAttachedIeds=${this.getAttachedIeds}
                    ?readonly=${this.readonly}
                  ></substation-editor>`)}
          </section>`
            : html `<h1>
            <span style="color: var(--base1)"
              >${translate('substation.missing')}</span
            >
          </h1>`}`;
    }
};
ZerolinePane.styles = css `
    h1,
    h3 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      line-height: 48px;
      padding-left: 0.3em;
      transition: background-color 150ms linear;
    }

    h1 > nav,
    h1 > abbr > mwc-icon-button {
      float: right;
    }

    abbr {
      text-decoration: none;
      border-bottom: none;
    }

    #iedcontainer {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
    property({ attribute: false })
], ZerolinePane.prototype, "doc", void 0);
__decorate([
    property({ type: Boolean })
], ZerolinePane.prototype, "readonly", void 0);
__decorate([
    property({ attribute: false })
], ZerolinePane.prototype, "getAttachedIeds", void 0);
__decorate([
    query('#commmap')
], ZerolinePane.prototype, "commmap", void 0);
__decorate([
    query('#showieds')
], ZerolinePane.prototype, "showieds", void 0);
__decorate([
    query('#gsecontrol')
], ZerolinePane.prototype, "gsecontrol", void 0);
__decorate([
    query('#createsubstation')
], ZerolinePane.prototype, "createsubstation", void 0);
ZerolinePane = __decorate([
    customElement('zeroline-pane')
], ZerolinePane);
export { ZerolinePane };
//# sourceMappingURL=zeroline-pane.js.map