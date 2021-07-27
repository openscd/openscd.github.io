var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {
  LitElement,
  html,
  property,
  customElement,
  css
} from "../_snowpack/pkg/lit-element.js";
import {until} from "../_snowpack/pkg/lit-html/directives/until.js";
import {translate} from "../_snowpack/pkg/lit-translate.js";
import {isPublic, newWizardEvent} from "./foundation.js";
import {getAttachedIeds, styles} from "./zeroline/foundation.js";
import "./zeroline/substation-editor.js";
import "./zeroline/ied-editor.js";
import {wizards} from "./wizards/wizard-library.js";
function shouldShowIEDs() {
  return localStorage.getItem("showieds") === "on";
}
function setShowIEDs(value) {
  localStorage.setItem("showieds", value);
}
export let ZerolinePane = class extends LitElement {
  constructor() {
    super(...arguments);
    this.readonly = false;
    this.getAttachedIeds = async () => [];
  }
  openCreateSubstationWizard() {
    const wizard = wizards["Substation"].create(this.doc.documentElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  toggleShowIEDs() {
    console.warn(shouldShowIEDs());
    if (shouldShowIEDs())
      setShowIEDs("off");
    else
      setShowIEDs("on");
    console.log(shouldShowIEDs());
    this.requestUpdate();
  }
  async renderIedContainer() {
    this.getAttachedIeds = shouldShowIEDs() ? getAttachedIeds(this.doc) : async () => [];
    const ieds = await this.getAttachedIeds?.(this.doc.documentElement);
    await new Promise(requestAnimationFrame);
    return ieds.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  render() {
    return html`
      <h1>
          ${html`<abbr title="${translate("add")}">
            <mwc-icon-button
              icon="playlist_add"
              @click=${() => this.openCreateSubstationWizard()}
            ></mwc-icon-button>
          </abbr> `}
          </nav>
          <nav>
        <abbr title="${translate("zeroline.showieds")}">
          <mwc-icon-button-toggle
            ?on=${shouldShowIEDs()}
            @click=${() => this.toggleShowIEDs()}
            id="showieds"
            onIcon="developer_board"
            offIcon="developer_board_off"
          ></mwc-icon-button-toggle>
        </abbr>
      </nav>
        </h1>
      ${until(this.renderIedContainer(), html`<span>loading ieds...</span>`)}
      ${this.doc?.querySelector(":root > Substation") ? html`<section tabindex="0">
              ${Array.from(this.doc.querySelectorAll("Substation") ?? []).filter(isPublic).map((substation) => html`<substation-editor
                      .element=${substation}
                      .getAttachedIeds=${this.getAttachedIeds}
                      ?readonly=${this.readonly}
                    ></substation-editor>`)}
            </section>` : html`<h1>
              <span style="color: var(--base1)"
                >${translate("substation.missing")}</span
              >
            </h1>`}`;
  }
};
ZerolinePane.styles = css`
    ${styles}
  `;
__decorate([
  property({attribute: false})
], ZerolinePane.prototype, "doc", 2);
__decorate([
  property({type: Boolean})
], ZerolinePane.prototype, "readonly", 2);
__decorate([
  property({attribute: false})
], ZerolinePane.prototype, "getAttachedIeds", 2);
ZerolinePane = __decorate([
  customElement("zeroline-pane")
], ZerolinePane);
