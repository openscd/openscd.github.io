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
  customElement,
  html,
  LitElement,
  property,
  state
} from "../../_snowpack/pkg/lit-element.js";
import {classMap} from "../../_snowpack/pkg/lit-html/directives/class-map.js";
import "../../_snowpack/pkg/@material/mwc-icon.js";
import "../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../_snowpack/pkg/@material/mwc-linear-progress.js";
import "../../_snowpack/pkg/@material/mwc-list.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../_snowpack/pkg/@material/mwc-tab.js";
import "../../_snowpack/pkg/@material/mwc-tab-bar.js";
import "../../_snowpack/pkg/@material/mwc-top-app-bar-fixed.js";
import "../../_snowpack/pkg/@material/mwc-drawer.js";
import "../../_snowpack/pkg/@material/mwc-button.js";
import "../../_snowpack/pkg/@material/mwc-dialog.js";
import "../../_snowpack/pkg/@material/mwc-formfield.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-radio-list-item.js";
import "../../_snowpack/pkg/@material/mwc-select.js";
import "../../_snowpack/pkg/@material/mwc-switch.js";
import "../../_snowpack/pkg/@material/mwc-textfield.js";
import {newOpenDocEvent} from "../../_snowpack/link/packages/core/dist/foundation/deprecated/open-event.js";
import {newPendingStateEvent} from "../../_snowpack/link/packages/core/dist/foundation/deprecated/waiter.js";
import "./addons/Settings.js";
import "./addons/Waiter.js";
import "./addons/Wizards.js";
import "./addons/Editor.js";
import "./addons/History.js";
import "./addons/Layout.js";
import {officialPlugins as builtinPlugins} from "./plugins.js";
import {initializeNsdoc} from "./foundation/nsdoc.js";
import {newConfigurePluginEvent} from "./plugin.events.js";
import {newLogEvent} from "../../_snowpack/link/packages/core/dist/foundation/deprecated/history.js";
export function newResetPluginsEvent() {
  return new CustomEvent("reset-plugins", {bubbles: true, composed: true});
}
export function newAddExternalPluginEvent(plugin) {
  return new CustomEvent("add-external-plugin", {
    bubbles: true,
    composed: true,
    detail: {plugin}
  });
}
export function newSetPluginsEvent(indices) {
  return new CustomEvent("set-plugins", {
    bubbles: true,
    composed: true,
    detail: {indices}
  });
}
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
function withoutContent(plugin) {
  return {...plugin, content: void 0};
}
export const pluginIcons = {
  editor: "tab",
  menu: "play_circle",
  validator: "rule_folder",
  top: "play_circle",
  middle: "play_circle",
  bottom: "play_circle"
};
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
export let OpenSCD = class extends LitElement {
  constructor() {
    super(...arguments);
    this.doc = null;
    this.docName = "";
    this.docId = "";
    this.editCount = -1;
    this.nsdoc = initializeNsdoc();
    this.currentSrc = "";
    this.plugins = {menu: [], editor: []};
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
  handleAddExternalPlugin(e) {
    this.addExternalPlugin(e.detail.plugin);
    const {name, kind} = e.detail.plugin;
    const event = newConfigurePluginEvent(name, kind, e.detail.plugin);
    this.handleConfigurationPluginEvent(event);
  }
  handleConfigurationPluginEvent(e) {
    const {name, kind, config} = e.detail;
    const hasPlugin = this.hasPlugin(name, kind);
    const hasConfig = config !== null;
    const isChangeEvent = hasPlugin && hasConfig;
    const isRemoveEvent = hasPlugin && !hasConfig;
    const isAddEvent = !hasPlugin && hasConfig;
    if (isChangeEvent && config) {
      this.changePlugin(config);
    } else if (isRemoveEvent) {
      this.removePlugin(name, kind);
    } else if (isAddEvent && config) {
      this.addPlugin(config);
    } else {
      const event = newLogEvent({
        kind: "error",
        title: "Invalid plugin configuration event",
        message: JSON.stringify({name, kind, config})
      });
      this.dispatchEvent(event);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("reset-plugins", this.resetPlugins);
    this.addEventListener("set-plugins", (e) => {
      this.setPlugins(e.detail.indices);
    });
    this.updatePlugins();
    this.requestUpdate();
    this.addEventListener("oscd-edit-completed", (evt) => {
      const initiator = evt.detail.initiator;
      if (initiator === "undo") {
        this.editCount -= 1;
      } else {
        this.editCount += 1;
      }
      this.requestUpdate();
    });
  }
  render() {
    return html`<oscd-waiter>
      <oscd-settings .host=${this}>
        <oscd-wizards .host=${this}>
          <oscd-history .host=${this} .editCount=${this.editCount}>
            <oscd-editor
              .doc=${this.doc}
              .docName=${this.docName}
              .docId=${this.docId}
              .host=${this}
              .editCount=${this.editCount}
            >
              <oscd-layout
                @add-external-plugin=${this.handleAddExternalPlugin}
                @oscd-configure-plugin=${this.handleConfigurationPluginEvent}
                .host=${this}
                .doc=${this.doc}
                .docName=${this.docName}
                .editCount=${this.editCount}
                .plugins=${this.sortedStoredPlugins}
              >
              </oscd-layout>
            </oscd-editor>
          </oscd-history>
        </oscd-wizards>
      </oscd-settings>
    </oscd-waiter>`;
  }
  storePlugins(plugins) {
    localStorage.setItem("plugins", JSON.stringify(plugins.map(withoutContent)));
    this.requestUpdate();
  }
  findPluginIndex(name, kind) {
    return this.storedPlugins.findIndex((p) => p.name === name && p.kind === kind);
  }
  hasPlugin(name, kind) {
    return this.findPluginIndex(name, kind) > -1;
  }
  removePlugin(name, kind) {
    const newPlugins = this.storedPlugins.filter((p) => p.name !== name || p.kind !== kind);
    this.storePlugins(newPlugins);
  }
  addPlugin(plugin) {
    const newPlugins = [...this.storedPlugins, plugin];
    this.storePlugins(newPlugins);
  }
  changePlugin(plugin) {
    const storedPlugins = this.storedPlugins;
    const {name, kind} = plugin;
    const pluginIndex = this.findPluginIndex(name, kind);
    if (pluginIndex < 0) {
      const event = newLogEvent({
        kind: "error",
        title: "Plugin not found, stopping change process",
        message: JSON.stringify({name, kind})
      });
      this.dispatchEvent(event);
      return;
    }
    const pluginToChange = storedPlugins[pluginIndex];
    const changedPlugin = {...pluginToChange, ...plugin};
    const newPlugins = [...storedPlugins];
    newPlugins.splice(pluginIndex, 1, changedPlugin);
    this.storePlugins(newPlugins);
  }
  resetPlugins() {
    this.storePlugins(builtinPlugins.concat(this.parsedPlugins).map((plugin) => {
      return {
        src: plugin.src,
        installed: plugin.default ?? false,
        official: true
      };
    }));
  }
  get parsedPlugins() {
    const menuPlugins = this.plugins.menu.map((plugin) => {
      let newPosition = plugin.position;
      if (typeof plugin.position === "number") {
        newPosition = void 0;
      }
      return {
        ...plugin,
        position: newPosition,
        kind: "menu",
        installed: plugin.active ?? false
      };
    });
    const editorPlugins = this.plugins.editor.map((plugin) => ({
      ...plugin,
      position: void 0,
      kind: "editor",
      installed: plugin.active ?? false
    }));
    const allPlugnis = [...menuPlugins, ...editorPlugins];
    return allPlugnis;
  }
  get sortedStoredPlugins() {
    const mergedPlugins = this.storedPlugins.map((plugin) => {
      if (!plugin.official) {
        return plugin;
      }
      ;
      const officialPlugin = builtinPlugins.concat(this.parsedPlugins).find((needle) => needle.src === plugin.src);
      return {
        ...officialPlugin,
        ...plugin
      };
    });
    return mergedPlugins.sort(compareNeedsDoc).sort(menuCompare);
  }
  get storedPlugins() {
    const pluginsConfigStr = localStorage.getItem("plugins") ?? "[]";
    const storedPlugins = JSON.parse(pluginsConfigStr);
    const plugins = storedPlugins.map((plugin) => {
      const isInstalled = plugin.src && plugin.installed;
      if (!isInstalled) {
        return plugin;
      }
      return this.addContent(plugin);
    });
    return plugins;
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
    const newPlugins = this.sortedStoredPlugins.map((plugin, index) => {
      return {
        ...plugin,
        installed: indices.has(index)
      };
    });
    this.storePlugins(newPlugins);
  }
  updatePlugins() {
    const stored = this.storedPlugins;
    const officialStored = stored.filter((p) => p.official);
    const newOfficial = builtinPlugins.concat(this.parsedPlugins).filter((p) => !officialStored.find((o) => o.src === p.src)).map((plugin) => {
      return {
        src: plugin.src,
        installed: plugin.default ?? false,
        official: true
      };
    });
    const oldOfficial = officialStored.filter((p) => !builtinPlugins.concat(this.parsedPlugins).find((o) => p.src === o.src));
    const newPlugins = stored.filter((p) => !oldOfficial.find((o) => p.src === o.src));
    newOfficial.map((p) => newPlugins.push(p));
    this.storePlugins(newPlugins);
  }
  async addExternalPlugin(plugin) {
    if (this.storedPlugins.some((p) => p.src === plugin.src))
      return;
    const newPlugins = this.storedPlugins;
    newPlugins.push(plugin);
    this.storePlugins(newPlugins);
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
};
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
  state()
], OpenSCD.prototype, "editCount", 2);
__decorate([
  property({attribute: false})
], OpenSCD.prototype, "nsdoc", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "src", 1);
__decorate([
  property({type: Object})
], OpenSCD.prototype, "plugins", 2);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
