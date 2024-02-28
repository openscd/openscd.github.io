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
  LitElement,
  property,
  query
} from "../_snowpack/pkg/lit-element.js";
import "../_snowpack/pkg/@material/mwc-icon.js";
import "../_snowpack/pkg/@material/mwc-icon-button.js";
import "../_snowpack/pkg/@material/mwc-linear-progress.js";
import "../_snowpack/pkg/@material/mwc-list.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../_snowpack/pkg/@material/mwc-tab.js";
import "../_snowpack/pkg/@material/mwc-tab-bar.js";
import "../_snowpack/pkg/@material/mwc-top-app-bar-fixed.js";
import "../_snowpack/pkg/@material/mwc-drawer.js";
import {
  newOpenDocEvent,
  newPendingStateEvent,
  newSettingsUIEvent
} from "./foundation.js";
import {Editing} from "./Editing.js";
import {Historing} from "./Historing.js";
import {Plugging, pluginIcons} from "./Plugging.js";
import {Wizarding} from "./Wizarding.js";
import "./addons/Settings.js";
import "./addons/Waiter.js";
import {initializeNsdoc} from "./foundation/nsdoc.js";
import {List} from "../_snowpack/pkg/@material/mwc-list.js";
import {translate} from "../_snowpack/pkg/lit-translate.js";
export let OpenSCD = class extends Wizarding(Plugging(Editing(Historing(LitElement)))) {
  constructor() {
    super();
    this.nsdoc = initializeNsdoc();
    this.currentSrc = "";
    this.activeTab = 0;
    this.validated = Promise.resolve();
    this.shouldValidate = false;
    this.handleKeyPress = this.handleKeyPress.bind(this);
    document.onkeydown = this.handleKeyPress;
  }
  get src() {
    return this.currentSrc;
  }
  set src(value) {
    this.currentSrc = value;
    this.dispatchEvent(newPendingStateEvent(this.loadDoc(value)));
  }
  async loadDoc(src) {
    const response = await fetch(src);
    const text = await response.text();
    if (!text)
      return;
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const docName = src;
    this.dispatchEvent(newOpenDocEvent(doc, docName));
    if (src.startsWith("blob:"))
      URL.revokeObjectURL(src);
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
    if (ctrlAnd("d"))
      this.diagnosticUI.open ? this.diagnosticUI.close() : this.diagnosticUI.show();
    if (ctrlAnd("m"))
      this.menuUI.open = !this.menuUI.open;
    if (ctrlAnd("o"))
      this.menuUI.querySelector('mwc-list-item[iconid="folder_open"]')?.click();
    if (ctrlAnd("O"))
      this.menuUI.querySelector('mwc-list-item[iconid="create_new_folder"]')?.click();
    if (ctrlAnd("s"))
      this.menuUI.querySelector('mwc-list-item[iconid="save"]')?.click();
    if (ctrlAnd("P"))
      this.pluginUI.show();
    if (handled)
      e.preventDefault();
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("validate", async () => {
      this.shouldValidate = true;
      await this.validated;
      if (!this.shouldValidate)
        return;
      this.diagnoses.clear();
      this.shouldValidate = false;
      this.validated = Promise.allSettled(this.menuUI.querySelector("mwc-list").items.filter((item) => item.className === "validator").map((item) => item.nextElementSibling.validate())).then();
      this.dispatchEvent(newPendingStateEvent(this.validated));
    });
    this.addEventListener("close-drawer", async () => {
      this.menuUI.open = false;
    });
  }
  renderMain() {
    return html`${this.renderHosting()}${super.render()}`;
  }
  render() {
    return html`<oscd-waiter>
      <oscd-settings .host=${this} .nsdoc=${this.nsdoc}>
        ${this.renderMain()}
      </oscd-settings>
    </oscd-waiter>`;
  }
  get menu() {
    const topMenu = [];
    const middleMenu = [];
    const bottomMenu = [];
    const validators = [];
    this.topMenu.forEach((plugin) => topMenu.push({
      icon: plugin.icon || pluginIcons["menu"],
      name: plugin.name,
      action: (ae) => {
        this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].nextElementSibling.run()));
      },
      disabled: () => plugin.requireDoc && this.doc === null,
      content: plugin.content,
      kind: "top"
    }));
    this.middleMenu.forEach((plugin) => middleMenu.push({
      icon: plugin.icon || pluginIcons["menu"],
      name: plugin.name,
      action: (ae) => {
        this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].nextElementSibling.run()));
      },
      disabled: () => plugin.requireDoc && this.doc === null,
      content: plugin.content,
      kind: "middle"
    }));
    this.bottomMenu.forEach((plugin) => bottomMenu.push({
      icon: plugin.icon || pluginIcons["menu"],
      name: plugin.name,
      action: (ae) => {
        this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].nextElementSibling.run()));
      },
      disabled: () => plugin.requireDoc && this.doc === null,
      content: plugin.content,
      kind: "middle"
    }));
    this.validators.forEach((plugin) => validators.push({
      icon: plugin.icon || pluginIcons["validator"],
      name: plugin.name,
      action: (ae) => {
        if (this.diagnoses.get(plugin.src))
          this.diagnoses.get(plugin.src).length = 0;
        this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].nextElementSibling.validate()));
      },
      disabled: () => this.doc === null,
      content: plugin.content,
      kind: "validator"
    }));
    if (middleMenu.length > 0)
      middleMenu.push("divider");
    if (bottomMenu.length > 0)
      bottomMenu.push("divider");
    return [
      "divider",
      ...topMenu,
      "divider",
      {
        icon: "undo",
        name: "undo",
        actionItem: true,
        action: this.undo,
        disabled: () => !this.canUndo,
        kind: "static"
      },
      {
        icon: "redo",
        name: "redo",
        actionItem: true,
        action: this.redo,
        disabled: () => !this.canRedo,
        kind: "static"
      },
      ...validators,
      {
        icon: "list",
        name: "menu.viewLog",
        actionItem: true,
        action: () => this.logUI.show(),
        kind: "static"
      },
      {
        icon: "history",
        name: "menu.viewHistory",
        actionItem: true,
        action: () => this.historyUI.show(),
        kind: "static"
      },
      {
        icon: "rule",
        name: "menu.viewDiag",
        actionItem: true,
        action: () => this.diagnosticUI.show(),
        kind: "static"
      },
      "divider",
      ...middleMenu,
      {
        icon: "settings",
        name: "settings.title",
        action: () => {
          this.dispatchEvent(newSettingsUIEvent(true));
        },
        kind: "static"
      },
      ...bottomMenu,
      {
        icon: "extension",
        name: "plugins.heading",
        action: () => this.pluginUI.show(),
        kind: "static"
      }
    ];
  }
  renderMenuItem(me) {
    if (me === "divider")
      return html`<li divider padded role="separator"></li>`;
    if (me.actionItem)
      return html``;
    return html`
      <mwc-list-item
        class="${me.kind}"
        iconid="${me.icon}"
        graphic="icon"
        .disabled=${me.disabled?.() || !me.action}
        ><mwc-icon slot="graphic">${me.icon}</mwc-icon>
        <span>${translate(me.name)}</span>
        ${me.hint ? html`<span slot="secondary"><tt>${me.hint}</tt></span>` : ""}
      </mwc-list-item>
      ${me.content ?? ""}
    `;
  }
  renderActionItem(me) {
    if (me !== "divider" && me.actionItem)
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
  renderEditorTab({name, icon}) {
    return html`<mwc-tab label=${translate(name)} icon=${icon || "edit"}>
    </mwc-tab>`;
  }
  renderHosting() {
    return html` <mwc-drawer
        class="mdc-theme--surface"
        hasheader
        type="modal"
        id="menu"
      >
        <span slot="title">${translate("menu.title")}</span>
        ${this.docName ? html`<span slot="subtitle">${this.docName}</span>` : ""}
        <mwc-list
          wrapFocus
          @action=${(ae) => {
      if (ae.target instanceof List)
        this.menu.filter((item) => item !== "divider" && !item.actionItem)[ae.detail.index]?.action?.(ae);
    }}
        >
          ${this.menu.map(this.renderMenuItem)}
        </mwc-list>

        <mwc-top-app-bar-fixed slot="appContent">
          <mwc-icon-button
            icon="menu"
            label="Menu"
            slot="navigationIcon"
            @click=${() => this.menuUI.open = true}
          ></mwc-icon-button>
          <div slot="title" id="title">${this.docName}</div>
          ${this.menu.map(this.renderActionItem)}
          ${this.doc ? html`<mwc-tab-bar
                @MDCTabBar:activated=${(e) => this.activeTab = e.detail.index}
              >
                ${this.editors.map(this.renderEditorTab)}
              </mwc-tab-bar>` : ``}
        </mwc-top-app-bar-fixed>
      </mwc-drawer>

      ${this.doc && this.editors[this.activeTab]?.content ? this.editors[this.activeTab].content : html`<div class="landing">
            ${this.menu.filter((mi) => mi !== "divider").map((mi, index) => mi.kind === "top" && !mi.disabled?.() ? html`
                      <mwc-icon-button
                        class="landing_icon"
                        icon="${mi.icon}"
                        @click="${() => this.menuUI.querySelector("mwc-list").items[index].click()}"
                      >
                        <div class="landing_label">${mi.name}</div>
                      </mwc-icon-button>
                    ` : html``)}
          </div>`}`;
  }
};
OpenSCD.styles = css`
    mwc-top-app-bar-fixed {
      --mdc-theme-text-disabled-on-light: rgba(255, 255, 255, 0.38);
    } /* hack to fix disabled icon buttons rendering black */

    mwc-tab {
      background-color: var(--primary);
      --mdc-theme-primary: var(--mdc-theme-on-primary);
    }

    input[type='file'] {
      display: none;
    }

    mwc-dialog {
      --mdc-dialog-max-width: 98vw;
    }

    mwc-dialog > form {
      display: flex;
      flex-direction: column;
    }

    mwc-dialog > form > * {
      display: block;
      margin-top: 16px;
    }

    mwc-linear-progress {
      position: fixed;
      --mdc-linear-progress-buffer-color: var(--primary);
      --mdc-theme-primary: var(--secondary);
      left: 0px;
      top: 0px;
      width: 100%;
      pointer-events: none;
      z-index: 1000;
    }

    tt {
      font-family: 'Roboto Mono', monospace;
      font-weight: 300;
    }

    .landing {
      position: absolute;
      text-align: center;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
    }

    .landing_icon:hover {
      box-shadow: 0 12px 17px 2px rgba(0, 0, 0, 0.14),
        0 5px 22px 4px rgba(0, 0, 0, 0.12), 0 7px 8px -4px rgba(0, 0, 0, 0.2);
    }

    .landing_icon {
      margin: 12px;
      border-radius: 16px;
      width: 160px;
      height: 140px;
      text-align: center;
      color: var(--mdc-theme-on-secondary);
      background: var(--secondary);
      --mdc-icon-button-size: 100px;
      --mdc-icon-size: 100px;
      --mdc-ripple-color: rgba(0, 0, 0, 0);
      box-shadow: rgb(0 0 0 / 14%) 0px 6px 10px 0px,
        rgb(0 0 0 / 12%) 0px 1px 18px 0px, rgb(0 0 0 / 20%) 0px 3px 5px -1px;
      transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .landing_label {
      width: 160px;
      height: 50px;
      margin-top: 100px;
      margin-left: -30px;
      font-family: 'Roboto', sans-serif;
    }

    .plugin.menu {
      display: flex;
    }

    .plugin.validator {
      display: flex;
    }
  `;
__decorate([
  property({attribute: false})
], OpenSCD.prototype, "nsdoc", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "src", 1);
__decorate([
  property({type: Number})
], OpenSCD.prototype, "activeTab", 2);
__decorate([
  property({attribute: false})
], OpenSCD.prototype, "validated", 2);
__decorate([
  query("#menu")
], OpenSCD.prototype, "menuUI", 2);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
