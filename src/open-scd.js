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
  TemplateResult,
  css,
  customElement,
  html,
  property,
  query
} from "../web_modules/lit-element.js";
import {translate, get} from "../web_modules/lit-translate.js";
import {until as until2} from "../web_modules/lit-html/directives/until.js";
import {cache as cache2} from "../web_modules/lit-html/directives/cache.js";
import "../web_modules/@material/mwc-button.js";
import "../web_modules/@material/mwc-drawer.js";
import "../web_modules/@material/mwc-icon.js";
import "../web_modules/@material/mwc-icon-button.js";
import "../web_modules/@material/mwc-linear-progress.js";
import "../web_modules/@material/mwc-list.js";
import "../web_modules/@material/mwc-list/mwc-list-item.js";
import "../web_modules/@material/mwc-tab.js";
import "../web_modules/@material/mwc-tab-bar.js";
import "../web_modules/@material/mwc-top-app-bar-fixed.js";
import {Editing as Editing2, newEmptySCD} from "./Editing.js";
import {Logging as Logging2} from "./Logging.js";
import {Waiting as Waiting2} from "./Waiting.js";
import {Wizarding as Wizarding2} from "./Wizarding.js";
import {Validating as Validating2} from "./Validating.js";
import {getTheme} from "./themes.js";
import {Setting as Setting2} from "./Setting.js";
import {newLogEvent, newPendingStateEvent} from "./foundation.js";
import {plugin as plugin2} from "./plugin.js";
import {zeroLineIcon} from "./icons.js";
import {selectors} from "./editors/substation/foundation.js";
export let OpenSCD = class extends Setting2(Wizarding2(Waiting2(Validating2(Editing2(Logging2(LitElement)))))) {
  constructor() {
    super();
    this.activeTab = 0;
    this.srcName = "untitled.scd";
    this.currentSrc = "";
    this.menu = [
      {
        icon: "folder_open",
        name: "menu.open",
        startsGroup: true,
        actionItem: true,
        action: () => this.fileUI.click()
      },
      {icon: "create_new_folder", name: "menu.new"},
      {icon: "snippet_folder", name: "menu.importIED"},
      {icon: "save", name: "save"},
      {
        icon: "undo",
        name: "undo",
        startsGroup: true,
        actionItem: true,
        action: this.undo,
        disabled: () => !this.canUndo
      },
      {
        icon: "redo",
        name: "redo",
        actionItem: true,
        action: this.redo,
        disabled: () => !this.canRedo
      },
      {icon: "rule_folder", name: "menu.validate", startsGroup: true},
      {
        icon: "rule",
        name: "menu.viewLog",
        actionItem: true,
        action: () => this.logUI.show()
      },
      {
        icon: "settings",
        name: "settings.name",
        startsGroup: true,
        action: () => this.settingsUI.show()
      }
    ];
    this.plugins = {
      editors: [
        {
          name: "substation.name",
          id: "substation",
          icon: zeroLineIcon,
          getContent: () => plugin2("./editors/SubstationEditor.js", "editor-0").then(() => html`<editor-0 .doc=${this.doc}></editor-0>`)
        }
      ]
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
    document.onkeydown = this.handleKeyPress;
  }
  get name() {
    return this.doc.querySelector(selectors.Substation)?.getAttribute("name") ?? null;
  }
  get src() {
    return this.currentSrc;
  }
  set src(value) {
    this.currentSrc = value;
    this.dispatchEvent(newPendingStateEvent(this.loadDoc(value)));
  }
  loadDoc(src) {
    return new Promise((resolve, reject) => {
      this.reset();
      this.dispatchEvent(newLogEvent({
        kind: "info",
        title: get("openSCD.loading", {name: this.srcName})
      }));
      const reader = new FileReader();
      reader.addEventListener("error", () => reject(get("openSCD.readError", {name: this.srcName})));
      reader.addEventListener("abort", () => reject(get("openSCD.readAbort", {name: this.srcName})));
      reader.addEventListener("load", () => {
        this.doc = reader.result ? new DOMParser().parseFromString(reader.result, "application/xml") : newEmptySCD();
        if (src.startsWith("blob:"))
          URL.revokeObjectURL(src);
        this.validate(this.doc, {fileName: this.srcName});
        resolve(get("openSCD.loaded", {name: this.srcName}));
      });
      fetch(src ?? "").then((res) => res.blob().then((b) => reader.readAsText(b)));
    });
  }
  loadFile(event) {
    const file = event.target?.files?.item(0) ?? false;
    if (file) {
      this.srcName = file.name;
      this.setAttribute("src", URL.createObjectURL(file));
    }
  }
  handleKeyPress(e) {
    let handled = false;
    const ctrlAnd = (key) => e.key === key && e.ctrlKey && (handled = true);
    if (ctrlAnd("y"))
      this.redo();
    if (ctrlAnd("z"))
      this.undo();
    if (ctrlAnd("l"))
      this.logUI.open ? this.logUI.close() : this.logUI.show();
    if (ctrlAnd("m"))
      this.menuUI.open = !this.menuUI.open;
    if (ctrlAnd("o"))
      this.fileUI.click();
    if (handled)
      e.preventDefault();
  }
  renderMenuEntry(me) {
    return html`
      ${me.startsGroup ? html`<li divider padded role="separator"></li>` : ""}
      <mwc-list-item
        iconid="${me.icon}"
        graphic="icon"
        .disabled=${me.disabled?.() || (me.action ? false : true)}
        ?twoline=${me.hint}
        ><mwc-icon slot="graphic"> ${me.icon} </mwc-icon>
        <span>${translate(me.name)}</span>
        ${me.hint ? html`<span slot="secondary"><tt>${me.hint}</tt></span>` : ""}
      </mwc-list-item>
    `;
  }
  renderActionItem(me) {
    if (me.actionItem)
      return html`<mwc-icon-button
        slot="actionItems"
        icon="${me.icon}"
        label="${me.name}"
        ?disabled=${me.disabled?.() || !me.action}
        @click=${me.action}
      ></mwc-icon-button>`;
    else
      return html``;
  }
  renderEditorTab({
    name,
    id,
    icon
  }) {
    return html`<mwc-tab
      label=${translate(name)}
      icon=${icon instanceof TemplateResult ? "" : icon}
      id=${id}
      hasimageicon
    >
      ${icon instanceof TemplateResult ? icon : ""}
    </mwc-tab>`;
  }
  render() {
    return html`
      <mwc-drawer class="mdc-theme--surface" hasheader type="modal" id="menu">
        <span slot="title">${this.name ?? html`${translate("menu.name")}`}</span>
        ${this.name ? html`<span slot="subtitle">${this.srcName}</span>` : ""}
        <mwc-list
          wrapFocus
          @action=${(ae) => this.menu[ae.detail.index]?.action()}
        > ${this.menu.map(this.renderMenuEntry)}
        </mwc-list>

        <mwc-top-app-bar-fixed slot="appContent">
          <mwc-icon-button
            icon="menu"
            label="Menu"
            slot="navigationIcon"
            @click=${() => this.menuUI.open = true}
          ></mwc-icon-button>
          <div slot="title" id="title">${this.name ?? this.srcName}</div>
          ${this.menu.map(this.renderActionItem)}
          <mwc-tab-bar
            @MDCTabBar:activated=${(e) => this.activeTab = e.detail.index}
          > ${this.plugins.editors.map(this.renderEditorTab)}
          </mwc-tab-bar>
        </mwc-top-app-bar-fixed>
      </mwc-drawer>

      ${cache2(until2(this.plugins.editors[this.activeTab].getContent(), html`<mwc-linear-progress indeterminate></mwc-linear-progress>`))}

      <input id="file-input" type="file" @change="${this.loadFile}"></input>
      ${super.render()}
      ${getTheme(this.settings.theme)}
    `;
  }
};
OpenSCD.styles = css`
    mwc-top-app-bar-fixed {
      --mdc-theme-text-disabled-on-light: rgba(255, 255, 255, 0.38);
    } /* hack to fix disabled icon buttons rendering black */

    mwc-tab {
      background-color: var(--blue);
      --mdc-theme-primary: var(--mdc-theme-on-primary);
    }

    #file-input {
      display: none;
    }

    mwc-dialog {
      --mdc-dialog-max-width: 92vw;
    }

    mwc-dialog > form {
      display: flex;
      flex-direction: column;
    }

    mwc-dialog > form > * {
      display: block;
      margin-top: 16px;
    }

    mwc-circular-progress-four-color {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    }

    tt {
      font-family: 'Roboto Mono', monospace;
      font-weight: 300;
    }
  `;
__decorate([
  property({type: Number})
], OpenSCD.prototype, "activeTab", 2);
__decorate([
  property()
], OpenSCD.prototype, "name", 1);
__decorate([
  property({type: String})
], OpenSCD.prototype, "srcName", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "src", 1);
__decorate([
  query("#menu")
], OpenSCD.prototype, "menuUI", 2);
__decorate([
  query("#file-input")
], OpenSCD.prototype, "fileUI", 2);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
