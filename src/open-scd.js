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
import {classMap} from "../_snowpack/pkg/lit-html/directives/class-map.js";
import "../_snowpack/pkg/@material/mwc-icon.js";
import "../_snowpack/pkg/@material/mwc-icon-button.js";
import "../_snowpack/pkg/@material/mwc-linear-progress.js";
import "../_snowpack/pkg/@material/mwc-list.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../_snowpack/pkg/@material/mwc-tab.js";
import "../_snowpack/pkg/@material/mwc-tab-bar.js";
import "../_snowpack/pkg/@material/mwc-top-app-bar-fixed.js";
import "../_snowpack/pkg/@material/mwc-drawer.js";
import "../_snowpack/pkg/@material/mwc-button.js";
import "../_snowpack/pkg/@material/mwc-dialog.js";
import "../_snowpack/pkg/@material/mwc-formfield.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-radio-list-item.js";
import "../_snowpack/pkg/@material/mwc-select.js";
import "../_snowpack/pkg/@material/mwc-switch.js";
import "../_snowpack/pkg/@material/mwc-textfield.js";
import {
  newOpenDocEvent,
  newPendingStateEvent,
  newSettingsUIEvent
} from "./foundation.js";
import {Historing} from "./Historing.js";
import "./addons/Settings.js";
import "./addons/Waiter.js";
import "./addons/Wizards.js";
import "./addons/Editor.js";
import {List} from "../_snowpack/pkg/@material/mwc-list.js";
import {get} from "../_snowpack/pkg/lit-translate.js";
import {officialPlugins} from "../public/js/plugins.js";
import {initializeNsdoc} from "./foundation/nsdoc.js";
const pluginTags = new Map();
function pluginTag(uri) {
  if (!pluginTags.has(uri)) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0, ch; i < uri.length; i++) {
      ch = uri.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    pluginTags.set(uri, "oscd-plugin" + ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")));
  }
  return pluginTags.get(uri);
}
function staticTagHtml(oldStrings, ...oldArgs) {
  const args = [...oldArgs];
  const firstArg = args.shift();
  const lastArg = args.pop();
  if (firstArg !== lastArg)
    throw new Error(`Opening tag <${firstArg}> does not match closing tag </${lastArg}>.`);
  const strings = [...oldStrings];
  const firstString = strings.shift();
  const secondString = strings.shift();
  const lastString = strings.pop();
  const penultimateString = strings.pop();
  strings.unshift(`${firstString}${firstArg}${secondString}`);
  strings.push(`${penultimateString}${lastArg}${lastString}`);
  return html(strings, ...args);
}
const menuPosition = ["top", "middle", "bottom"];
function withoutContent(plugin) {
  return {...plugin, content: void 0};
}
function storePlugins(plugins) {
  localStorage.setItem("plugins", JSON.stringify(plugins.map(withoutContent)));
}
export const pluginIcons = {
  editor: "tab",
  menu: "play_circle",
  validator: "rule_folder",
  top: "play_circle",
  middle: "play_circle",
  bottom: "play_circle"
};
function resetPlugins() {
  storePlugins(officialPlugins.map((plugin) => {
    return {
      src: plugin.src,
      installed: plugin.default ?? false,
      official: true
    };
  }));
}
const menuOrder = [
  "editor",
  "top",
  "validator",
  "middle",
  "bottom"
];
function menuCompare(a, b) {
  if (a.kind === b.kind && a.position === b.position)
    return 0;
  const earlier = menuOrder.find((kind) => [a.kind, b.kind, a.position, b.position].includes(kind));
  return [a.kind, a.position].includes(earlier) ? -1 : 1;
}
function compareNeedsDoc(a, b) {
  if (a.requireDoc === b.requireDoc)
    return 0;
  return a.requireDoc ? 1 : -1;
}
const loadedPlugins = new Set();
export let OpenSCD = class extends Historing(LitElement) {
  constructor() {
    super();
    this.doc = null;
    this.docName = "";
    this.docId = "";
    this.nsdoc = initializeNsdoc();
    this.currentSrc = "";
    this.activeTab = 0;
    this.validated = Promise.resolve();
    this.shouldValidate = false;
    this.handleKeyPress = this.handleKeyPress.bind(this);
    document.onkeydown = this.handleKeyPress;
    this.updatePlugins();
    this.requestUpdate();
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
  renderMain() {
    return html`${this.renderHosting()}${this.renderPlugging()}${super.render()}`;
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
  render() {
    return html`<oscd-waiter>
      <oscd-settings .host=${this}>
        <oscd-wizards .host=${this}>
          <oscd-editor
            .doc=${this.doc}
            .docName=${this.docName}
            .docId=${this.docId}
            .host=${this}
            .editCount=${this.editCount}
          >
            ${this.renderMain()}
          </oscd-editor>
        </oscd-wizards>
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
        <span>${get(me.name)}</span>
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
    return html`<mwc-tab label=${get(name)} icon=${icon || "edit"}> </mwc-tab>`;
  }
  renderHosting() {
    return html` <mwc-drawer
        class="mdc-theme--surface"
        hasheader
        type="modal"
        id="menu"
      >
        <span slot="title">${get("menu.title")}</span>
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
  get editors() {
    return this.plugins.filter((plugin) => plugin.installed && plugin.kind === "editor");
  }
  get validators() {
    return this.plugins.filter((plugin) => plugin.installed && plugin.kind === "validator");
  }
  get menuEntries() {
    return this.plugins.filter((plugin) => plugin.installed && plugin.kind === "menu");
  }
  get topMenu() {
    return this.menuEntries.filter((plugin) => plugin.position === "top");
  }
  get middleMenu() {
    return this.menuEntries.filter((plugin) => plugin.position === "middle");
  }
  get bottomMenu() {
    return this.menuEntries.filter((plugin) => plugin.position === "bottom");
  }
  get plugins() {
    return this.storedPlugins.map((plugin) => {
      if (!plugin.official)
        return plugin;
      const officialPlugin = officialPlugins.find((needle) => needle.src === plugin.src);
      return {
        ...officialPlugin,
        ...plugin
      };
    }).sort(compareNeedsDoc).sort(menuCompare);
  }
  get storedPlugins() {
    return JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value.src && value.installed ? this.addContent(value) : value);
  }
  get locale() {
    return navigator.language || "en-US";
  }
  get docs() {
    const docs = {};
    if (this.doc) {
      docs[this.docName] = this.doc;
    }
    return docs;
  }
  setPlugins(indices) {
    const newPlugins = this.plugins.map((plugin, index) => {
      return {...plugin, installed: indices.has(index)};
    });
    storePlugins(newPlugins);
    this.requestUpdate();
  }
  updatePlugins() {
    const stored = this.storedPlugins;
    const officialStored = stored.filter((p) => p.official);
    const newOfficial = officialPlugins.filter((p) => !officialStored.find((o) => o.src === p.src)).map((plugin) => {
      return {
        src: plugin.src,
        installed: plugin.default ?? false,
        official: true
      };
    });
    const oldOfficial = officialStored.filter((p) => !officialPlugins.find((o) => p.src === o.src));
    const newPlugins = stored.filter((p) => !oldOfficial.find((o) => p.src === o.src));
    newOfficial.map((p) => newPlugins.push(p));
    storePlugins(newPlugins);
  }
  addExternalPlugin(plugin) {
    if (this.storedPlugins.some((p) => p.src === plugin.src))
      return;
    const newPlugins = this.storedPlugins;
    newPlugins.push(plugin);
    storePlugins(newPlugins);
  }
  addContent(plugin) {
    const tag = pluginTag(plugin.src);
    if (!loadedPlugins.has(tag)) {
      loadedPlugins.add(tag);
      import(plugin.src).then((mod) => customElements.define(tag, mod.default));
    }
    return {
      ...plugin,
      content: staticTagHtml`<${tag}
            .doc=${this.doc}
            .docName=${this.docName}
            .editCount=${this.editCount}
            .docId=${this.docId}
            .pluginId=${plugin.src}
            .nsdoc=${this.nsdoc}
            .docs=${this.docs}
            .locale=${this.locale}
            class="${classMap({
        plugin: true,
        menu: plugin.kind === "menu",
        validator: plugin.kind === "validator",
        editor: plugin.kind === "editor"
      })}"
          ></${tag}>`
    };
  }
  handleAddPlugin() {
    const pluginSrcInput = this.pluginDownloadUI.querySelector("#pluginSrcInput");
    const pluginNameInput = this.pluginDownloadUI.querySelector("#pluginNameInput");
    const pluginKindList = this.pluginDownloadUI.querySelector("#pluginKindList");
    const requireDoc = this.pluginDownloadUI.querySelector("#requireDoc");
    const positionList = this.pluginDownloadUI.querySelector("#menuPosition");
    if (!(pluginSrcInput.checkValidity() && pluginNameInput.checkValidity() && pluginKindList.selected && requireDoc && positionList.selected))
      return;
    this.addExternalPlugin({
      src: pluginSrcInput.value,
      name: pluginNameInput.value,
      kind: pluginKindList.selected.value,
      requireDoc: requireDoc.checked,
      position: positionList.value,
      installed: true
    });
    this.requestUpdate();
    this.pluginUI.requestUpdate();
    this.pluginDownloadUI.close();
  }
  renderDownloadUI() {
    return html`
      <mwc-dialog id="pluginAdd" heading="${get("plugins.add.heading")}">
        <div style="display: flex; flex-direction: column; row-gap: 8px;">
          <p style="color:var(--mdc-theme-error);">
            ${get("plugins.add.warning")}
          </p>
          <mwc-textfield
            label="${get("plugins.add.name")}"
            helper="${get("plugins.add.nameHelper")}"
            required
            id="pluginNameInput"
          ></mwc-textfield>
          <mwc-list id="pluginKindList">
            <mwc-radio-list-item
              id="editor"
              value="editor"
              hasMeta
              selected
              left
              >${get("plugins.editor")}<mwc-icon slot="meta"
                >${pluginIcons["editor"]}</mwc-icon
              ></mwc-radio-list-item
            >
            <mwc-radio-list-item id="menu" value="menu" hasMeta left
              >${get("plugins.menu")}<mwc-icon slot="meta"
                >${pluginIcons["menu"]}</mwc-icon
              ></mwc-radio-list-item
            >
            <div id="menudetails">
              <mwc-formfield
                id="enabledefault"
                label="${get("plugins.requireDoc")}"
              >
                <mwc-switch id="requireDoc" checked></mwc-switch>
              </mwc-formfield>
              <mwc-select id="menuPosition" value="middle" fixedMenuPosition
                >${Object.values(menuPosition).map((menutype) => html`<mwc-list-item value="${menutype}"
                      >${get("plugins." + menutype)}</mwc-list-item
                    >`)}</mwc-select
              >
            </div>
            <style>
              #menudetails {
                display: none;
                padding: 20px;
                padding-left: 50px;
              }
              #menu[selected] ~ #menudetails {
                display: grid;
              }
              #enabledefault {
                padding-bottom: 20px;
              }
              #menuPosition {
                max-width: 250px;
              }
            </style>
            <mwc-radio-list-item id="validator" value="validator" hasMeta left
              >${get("plugins.validator")}<mwc-icon slot="meta"
                >${pluginIcons["validator"]}</mwc-icon
              ></mwc-radio-list-item
            >
          </mwc-list>
          <mwc-textfield
            label="${get("plugins.add.src")}"
            helper="${get("plugins.add.srcHelper")}"
            placeholder="http://example.com/plugin.js"
            type="url"
            required
            id="pluginSrcInput"
          ></mwc-textfield>
        </div>
        <mwc-button
          slot="secondaryAction"
          dialogAction="close"
          label="${get("cancel")}"
        ></mwc-button>
        <mwc-button
          slot="primaryAction"
          icon="add"
          label="${get("add")}"
          trailingIcon
          @click=${() => this.handleAddPlugin()}
        ></mwc-button>
      </mwc-dialog>
    `;
  }
  renderPluginKind(type, plugins) {
    return html`
      ${plugins.map((plugin) => html`<mwc-check-list-item
            class="${plugin.official ? "official" : "external"}"
            value="${plugin.src}"
            ?selected=${plugin.installed}
            hasMeta
            left
          >
            <mwc-icon slot="meta"
              >${plugin.icon || pluginIcons[plugin.kind]}</mwc-icon
            >
            ${plugin.name}
          </mwc-check-list-item>`)}
    `;
  }
  renderPluginUI() {
    return html`
      <mwc-dialog
        stacked
        id="pluginManager"
        heading="${get("plugins.heading")}"
      >
        <mwc-list
          id="pluginList"
          multi
          @selected=${(e) => this.setPlugins(e.detail.index)}
        >
          <mwc-list-item graphic="avatar" noninteractive
            ><strong>${get(`plugins.editor`)}</strong
            ><mwc-icon slot="graphic" class="inverted"
              >${pluginIcons["editor"]}</mwc-icon
            ></mwc-list-item
          >
          <li divider role="separator"></li>
          ${this.renderPluginKind("editor", this.plugins.filter((p) => p.kind === "editor"))}
          <mwc-list-item graphic="avatar" noninteractive
            ><strong>${get(`plugins.menu`)}</strong
            ><mwc-icon slot="graphic" class="inverted"
              ><strong>${pluginIcons["menu"]}</strong></mwc-icon
            ></mwc-list-item
          >
          <li divider role="separator"></li>
          ${this.renderPluginKind("top", this.plugins.filter((p) => p.kind === "menu" && p.position === "top"))}
          <li divider role="separator" inset></li>
          ${this.renderPluginKind("validator", this.plugins.filter((p) => p.kind === "validator"))}
          <li divider role="separator" inset></li>
          ${this.renderPluginKind("middle", this.plugins.filter((p) => p.kind === "menu" && p.position === "middle"))}
          <li divider role="separator" inset></li>
          ${this.renderPluginKind("bottom", this.plugins.filter((p) => p.kind === "menu" && p.position === "bottom"))}
        </mwc-list>
        <mwc-button
          slot="secondaryAction"
          icon="refresh"
          label="${get("reset")}"
          @click=${async () => {
      resetPlugins();
      this.requestUpdate();
    }}
          style="--mdc-theme-primary: var(--mdc-theme-error)"
        >
        </mwc-button>
        <mwc-button
          slot="secondaryAction"
          icon=""
          label="${get("close")}"
          dialogAction="close"
        ></mwc-button>
        <mwc-button
          outlined
          trailingIcon
          slot="primaryAction"
          icon="library_add"
          label="${get("plugins.add.heading")}&hellip;"
          @click=${() => this.pluginDownloadUI.show()}
        >
        </mwc-button>
      </mwc-dialog>
    `;
  }
  renderPlugging() {
    return html` ${this.renderPluginUI()} ${this.renderDownloadUI()} `;
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
], OpenSCD.prototype, "doc", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "docName", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "docId", 2);
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
__decorate([
  query("#pluginManager")
], OpenSCD.prototype, "pluginUI", 2);
__decorate([
  query("#pluginList")
], OpenSCD.prototype, "pluginList", 2);
__decorate([
  query("#pluginAdd")
], OpenSCD.prototype, "pluginDownloadUI", 2);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
