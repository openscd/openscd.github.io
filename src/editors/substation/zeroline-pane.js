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
  css,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "./line-editor.js";
import "./substation-editor.js";
import "./ied-editor.js";
import {communicationMappingWizard} from "../../wizards/commmap-wizards.js";
import {gooseIcon, smvIcon, reportIcon} from "../../icons/icons.js";
import {isPublic, newWizardEvent} from "../../foundation.js";
import {selectGseControlWizard} from "../../wizards/gsecontrol.js";
import {emptyWizard, wizards} from "../../wizards/wizard-library.js";
import {getAttachedIeds} from "./foundation.js";
import {selectSampledValueControlWizard} from "../../wizards/sampledvaluecontrol.js";
import {selectReportControlWizard} from "../../wizards/reportcontrol.js";
import {tags} from "../../foundation.js";
function shouldShowIEDs() {
  return localStorage.getItem("showieds") === "on";
}
function setShowIEDs(value) {
  localStorage.setItem("showieds", value);
}
function shouldShowFunctions() {
  return localStorage.getItem("showfunctions") === "on";
}
function setShowFunctions(value) {
  localStorage.setItem("showfunctions", value);
}
function childTags(element) {
  if (!element)
    return [];
  return tags[element.tagName].children.filter((child) => wizards[child].create !== emptyWizard);
}
export let ZerolinePane = class extends LitElement {
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
  openReportControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectReportControlWizard(this.doc.documentElement)));
  }
  openGseControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectGseControlWizard(this.doc.documentElement)));
  }
  openSampledValueControlSelection() {
    this.dispatchEvent(newWizardEvent(() => selectSampledValueControlWizard(this.doc.documentElement)));
  }
  toggleShowIEDs() {
    if (shouldShowIEDs())
      setShowIEDs("off");
    else
      setShowIEDs("on");
    this.requestUpdate();
  }
  toggleShowFunctions() {
    if (shouldShowFunctions())
      setShowFunctions("off");
    else
      setShowFunctions("on");
    this.requestUpdate();
  }
  renderIedContainer() {
    this.getAttachedIeds = shouldShowIEDs() ? getAttachedIeds(this.doc) : () => [];
    const ieds = this.getAttachedIeds?.(this.doc.documentElement) ?? [];
    return ieds.length ? html`<div id="iedcontainer">
          ${ieds.map((ied) => html`<ied-editor .doc=${this.doc} .element=${ied}></ied-editor>`)}
        </div>` : html``;
  }
  renderSubstation() {
    return this.doc?.querySelector(":root > Substation") ? html`<section>
          ${Array.from(this.doc.querySelectorAll(":root >Substation") ?? []).filter(isPublic).map((substation) => html`<substation-editor
                  .doc=${this.doc}
                  .element=${substation}
                  .getAttachedIeds=${this.getAttachedIeds}
                  ?readonly=${this.readonly}
                  ?showfunctions=${shouldShowFunctions()}
                ></substation-editor>`)}
        </section>` : html`<h1>
          <span style="color: var(--base1)"
            >${translate("substation.missing")}</span
          >
        </h1>`;
  }
  renderLines() {
    return this.doc?.querySelector(":root > Line") ? html`<section>
          ${Array.from(this.doc.querySelectorAll(":root >Line") ?? []).filter(isPublic).map((line) => html`<line-editor
                  .doc=${this.doc}
                  .element=${line}
                  ?showfunctions=${shouldShowFunctions()}
                ></line-editor>`)}
        </section>` : html``;
  }
  openCreateWizard(tagName) {
    const wizard = wizards[tagName].create(this.doc.documentElement);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  renderAddButtons() {
    return childTags(this.doc.documentElement).map((child) => html`<mwc-list-item value="${child}"
          ><span>${child}</span></mwc-list-item
        >`);
  }
  updated() {
    if (this.addMenu && this.addButton)
      this.addMenu.anchor = this.addButton;
  }
  render() {
    return html` <h1>
        <nav>
          <abbr slot="action" title="${translate("add")}">
            <mwc-icon-button
              icon="playlist_add"
              @click=${() => this.addMenu.open = true}
            ></mwc-icon-button
            ><mwc-menu
              corner="BOTTOM_LEFT"
              @action=${(e) => {
      const tagName = e.target.selected.value;
      this.openCreateWizard(tagName);
    }}
              >${this.renderAddButtons()}</mwc-menu
            ></abbr
          >
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
          <abbr title="${translate("zeroline.showfunctions")}">
            <mwc-icon-button-toggle
              ?on=${shouldShowFunctions()}
              @click=${() => this.toggleShowFunctions()}
              id="showfunctions"
              onIcon="layers"
              offIcon="layers_clear"
            ></mwc-icon-button-toggle>
          </abbr>
          <abbr title="${translate("zeroline.commmap")}">
            <mwc-icon-button
              id="commmap"
              icon="link"
              @click=${() => this.openCommunicationMapping()}
            ></mwc-icon-button>
          </abbr>
          <abbr title="${translate("zeroline.reportcontrol")}"
            ><mwc-icon-button
              id="reportcontrol"
              @click="${() => this.openReportControlSelection()}"
              >${reportIcon}</mwc-icon-button
            ></abbr
          >
          <abbr title="${translate("zeroline.gsecontrol")}"
            ><mwc-icon-button
              id="gsecontrol"
              @click="${() => this.openGseControlSelection()}"
              >${gooseIcon}</mwc-icon-button
            ></abbr
          >
          <abbr title="${translate("zeroline.smvcontrol")}"
            ><mwc-icon-button
              id="smvcontrol"
              @click="${() => this.openSampledValueControlSelection()}"
              >${smvIcon}</mwc-icon-button
            ></abbr
          >
        </nav>
      </h1>
      ${this.renderIedContainer()}
      ${this.renderSubstation()}${this.renderLines()}`;
  }
};
ZerolinePane.styles = css`
    h1 {
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

    section {
      padding: 8px 12px 16px;
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
      grid-template-columns: repeat(auto-fit, minmax(128px, auto));
    }
    :host {
      display: block;
      position: relative;
    }
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
__decorate([
  query("#commmap")
], ZerolinePane.prototype, "commmap", 2);
__decorate([
  query("#showieds")
], ZerolinePane.prototype, "showieds", 2);
__decorate([
  query("#showfunctions")
], ZerolinePane.prototype, "showfunctions", 2);
__decorate([
  query("#gsecontrol")
], ZerolinePane.prototype, "gsecontrol", 2);
__decorate([
  query("#smvcontrol")
], ZerolinePane.prototype, "smvcontrol", 2);
__decorate([
  query("#reportcontrol")
], ZerolinePane.prototype, "reportcontrol", 2);
__decorate([
  query("#createsubstation")
], ZerolinePane.prototype, "createsubstation", 2);
__decorate([
  query("mwc-menu")
], ZerolinePane.prototype, "addMenu", 2);
__decorate([
  query('mwc-icon-button[icon="playlist_add"]')
], ZerolinePane.prototype, "addButton", 2);
ZerolinePane = __decorate([
  customElement("zeroline-pane")
], ZerolinePane);
