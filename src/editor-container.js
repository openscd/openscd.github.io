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
  css,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  query
} from "../_snowpack/pkg/lit-element.js";
import {classMap} from "../_snowpack/pkg/lit-html/directives/class-map.js";
import {newWizardEvent, tags} from "./foundation.js";
import {emptyWizard, wizards} from "./wizards/wizard-library.js";
function childTags(element) {
  if (!element)
    return [];
  return tags[element.tagName].children.filter((child) => wizards[child].create !== emptyWizard);
}
export let EditorContainer = class extends LitElement {
  constructor() {
    super(...arguments);
    this.element = null;
    this.header = "";
    this.level = 1;
    this.secondary = false;
    this.contrasted = false;
    this.highlighted = false;
    this.nomargin = false;
  }
  get defaultHeader() {
    const name = this.element?.getAttribute("name") ?? "";
    const desc = this.element?.getAttribute("desc");
    return `${name}${desc ? ` - ${desc}` : ""}`;
  }
  openCreateWizard(tagName) {
    const wizard = wizards[tagName].create(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  async firstUpdated() {
    await super.updateComplete;
    if (this.addMenu)
      this.addMenu.anchor = this.headerContainer;
    const parentEditorContainer = this.parentNode.host?.closest("editor-container") ?? null;
    if (!parentEditorContainer)
      return;
    this.level = Math.min(parentEditorContainer.level + 1, 6);
    this.contrasted = !parentEditorContainer.contrasted;
    this.tabIndex = 0;
  }
  renderAddButtons() {
    return childTags(this.element).map((child) => html`<mwc-list-item value="${child}"
          ><span>${child}</span></mwc-list-item
        >`);
  }
  styleFabButtonTransform() {
    let transform = 0;
    return Array.from(this.children).map((child, i) => {
      if (child.tagName === "MWC-FAB")
        return `#morevert:focus-within >
        ::slotted(mwc-fab:nth-child(${i + 1})) { transform: translate(0,
        ${++transform * 48}px); }`;
      return ``;
    });
  }
  renderHeaderBody() {
    return html`${this.header !== "" ? this.header : this.defaultHeader}
      ${childTags(this.element).length ? html`<mwc-icon-button
              icon="playlist_add"
              @click=${() => this.addMenu.open = true}
            ></mwc-icon-button>
            <mwc-menu
              id="menu"
              corner="TOP_RIGHT"
              menuCorner="END"
              .anchor=${this.headerContainer}
              @selected=${(e) => {
      const tagName = e.target.selected.value;
      this.openCreateWizard(tagName);
    }}
              >${this.renderAddButtons()}
            </mwc-menu>` : html``}
      ${Array.from(this.children).some((child) => child.tagName === "MWC-FAB") ? html`<div id="morevert">
            <mwc-icon-button icon="more_vert"></mwc-icon-button>
            <slot name="morevert"></slot>
          </div>` : html``}<style>
        ${childTags(this.element).length ? html`::slotted(mwc-fab) {right: 48px;}` : html`::slotted(mwc-fab) {right: 0px;}`}
          ${this.styleFabButtonTransform()}
      </style>
      <nav><slot name="header"></slot></nav>`;
  }
  renderHeader() {
    let header = html``;
    switch (this.level) {
      case 1:
        header = html`<h1>${this.renderHeaderBody()}</h1>`;
        break;
      case 2:
        header = html`<h2>${this.renderHeaderBody()}</h2>`;
        break;
      case 3:
        header = html`<h3>${this.renderHeaderBody()}</h3>`;
        break;
      case 4:
        header = html`<h4>${this.renderHeaderBody()}</h4>`;
        break;
      case 5:
        header = html`<h5>${this.renderHeaderBody()}</h5>`;
        break;
      case 6:
        header = html`<h6>${this.renderHeaderBody()}</h6>`;
    }
    return html`<div id="header">${header}</div>`;
  }
  render() {
    return html`<section
      class="${classMap({
      container: true,
      secondary: this.secondary,
      highlighted: this.highlighted,
      contrasted: this.contrasted,
      nomargin: this.nomargin
    })}"
    >
      ${this.renderHeader()}
      <slot></slot>
    </section>`;
  }
};
EditorContainer.styles = css`
    :host(.moving) .container {
      opacity: 0.3;
    }

    .container {
      background-color: var(--mdc-theme-surface);
      transition: all 200ms linear;
      outline-style: solid;
      margin: 8px 12px 16px;
      overflow: hidden;
      outline-width: 0px;
      outline-color: var(--mdc-theme-primary);
      opacity: 1;
    }

    .container.secondary {
      outline-color: var(--mdc-theme-secondary);
    }

    .highlighted {
      outline-width: 2px;
    }

    .contrasted {
      background-color: var(--mdc-theme-on-primary);
    }

    .nomargin {
      margin: 0px;
      overflow: visible;
    }

    :host {
      outline: none;
    }

    :host(:focus-within) .container {
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
      outline-width: 2px;
      transition: all 250ms linear;
    }

    :host(:focus-within) h1,
    :host(:focus-within) h2,
    :host(:focus-within) h3 {
      color: var(--mdc-theme-surface);
      transition: background-color 200ms linear;
      background-color: var(--mdc-theme-primary);
    }

    :host(:focus-within) .container.secondary h1,
    :host(:focus-within) .container.secondary h2,
    :host(:focus-within) .container.secondary h3 {
      background-color: var(--mdc-theme-secondary);
    }

    h1,
    h2,
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

    h1 > ::slotted(mwc-icon-button),
    h2 > ::slotted(mwc-icon-button),
    h3 > ::slotted(mwc-icon-button),
    h1 > ::slotted(abbr),
    h2 > ::slotted(abbr),
    h3 > ::slotted(abbr) {
      float: right;
    }

    h1 > nav,
    h2 > nav,
    h3 > nav {
      float: right;
    }

    h1 > mwc-icon-button,
    h2 > mwc-icon-button,
    h3 > mwc-icon-button {
      float: right;
    }

    #morevert {
      float: right;
    }

    #header {
      position: relative;
    }

    abbr {
      text-decoration: none;
      border-bottom: none;
    }

    ::slotted(mwc-fab) {
      color: var(--mdc-theme-on-surface);
      opacity: 0;
      position: absolute;
      pointer-events: none;
      z-index: 1;
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 200ms linear;
    }

    #morevert:focus-within > ::slotted(mwc-fab) {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 250ms linear;
      pointer-events: auto;
      opacity: 1;
    }
  `;
__decorate([
  property()
], EditorContainer.prototype, "element", 2);
__decorate([
  property({type: String})
], EditorContainer.prototype, "header", 2);
__decorate([
  property({type: Number})
], EditorContainer.prototype, "level", 2);
__decorate([
  property({type: Boolean})
], EditorContainer.prototype, "secondary", 2);
__decorate([
  property({type: Boolean})
], EditorContainer.prototype, "contrasted", 2);
__decorate([
  property({type: Boolean})
], EditorContainer.prototype, "highlighted", 2);
__decorate([
  property({type: Boolean})
], EditorContainer.prototype, "nomargin", 2);
__decorate([
  internalProperty()
], EditorContainer.prototype, "defaultHeader", 1);
__decorate([
  query('mwc-icon-button[icon="playlist_add"]')
], EditorContainer.prototype, "addIcon", 2);
__decorate([
  query("#menu")
], EditorContainer.prototype, "addMenu", 2);
__decorate([
  query("#header")
], EditorContainer.prototype, "headerContainer", 2);
__decorate([
  query("#morevert > mwc-icon-button")
], EditorContainer.prototype, "moreVert", 2);
__decorate([
  query(".container")
], EditorContainer.prototype, "container", 2);
EditorContainer = __decorate([
  customElement("editor-container")
], EditorContainer);
