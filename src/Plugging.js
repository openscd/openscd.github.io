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
import {html as litHtml, query} from "../_snowpack/pkg/lit-element.js";
import {translate} from "../_snowpack/pkg/lit-translate.js";
import wrapHtml from "../_snowpack/pkg/carehtml.js";
const html = wrapHtml(litHtml);
import {ifImplemented} from "./foundation.js";
import {officialPlugins} from "../public/js/plugins.js";
const menuPosition = ["top", "middle", "bottom"];
export const pluginIcons = {
  editor: "tab",
  menu: "play_circle",
  validator: "rule_folder",
  top: "play_circle",
  middle: "play_circle",
  bottom: "play_circle"
};
function resetPlugins() {
  localStorage.setItem("plugins", JSON.stringify(officialPlugins.map((plugin) => {
    return {
      src: plugin.src,
      installed: plugin.default ?? false,
      official: true
    };
  })));
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
const loadedPlugins = new Map();
export function Plugging(Base) {
  class PluggingElement extends Base {
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
      return JSON.parse(localStorage.getItem("plugins") ?? "[]", (key, value) => value.src ? this.addContent(value) : value);
    }
    setPlugins(indices) {
      const newPlugins = this.plugins.map((plugin, index) => {
        return {...plugin, installed: indices.has(index), content: void 0};
      });
      localStorage.setItem("plugins", JSON.stringify(newPlugins));
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
      localStorage.setItem("plugins", JSON.stringify(newPlugins));
    }
    addExternalPlugin(plugin) {
      if (this.storedPlugins.some((p) => p.src === plugin.src))
        return;
      const newPlugins = this.storedPlugins;
      newPlugins.push(plugin);
      localStorage.setItem("plugins", JSON.stringify(newPlugins));
    }
    addContent(plugin) {
      return {
        ...plugin,
        content: async () => {
          if (!loadedPlugins.has(plugin.src))
            loadedPlugins.set(plugin.src, await import(plugin.src).then((mod) => mod.default));
          return html`<${loadedPlugins.get(plugin.src)}
            .doc=${this.doc}
            .docName=${this.docName}
            .docId=${this.docId}
            .pluginId=${plugin.src}
          ></${loadedPlugins.get(plugin.src)}>`;
        }
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
    constructor(...args) {
      super(...args);
      this.updatePlugins();
      this.requestUpdate();
    }
    renderDownloadUI() {
      return html`
        <mwc-dialog
          id="pluginAdd"
          heading="${translate("plugins.add.heading")}"
        >
          <div style="display: flex; flex-direction: column; row-gap: 8px;">
            <p style="color:var(--mdc-theme-error);">
              ${translate("plugins.add.warning")}
            </p>
            <mwc-textfield
              label="${translate("plugins.add.name")}"
              helper="${translate("plugins.add.nameHelper")}"
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
                >${translate("plugins.editor")}<mwc-icon slot="meta"
                  >${pluginIcons["editor"]}</mwc-icon
                ></mwc-radio-list-item
              >
              <mwc-radio-list-item id="menu" value="menu" hasMeta left
                >${translate("plugins.menu")}<mwc-icon slot="meta"
                  >${pluginIcons["menu"]}</mwc-icon
                ></mwc-radio-list-item
              >
              <div id="menudetails">
                <mwc-formfield
                  id="enabledefault"
                  label="${translate("plugins.requireDoc")}"
                >
                  <mwc-switch id="requireDoc" checked></mwc-switch>
                </mwc-formfield>
                <mwc-select id="menuPosition" value="middle" fixedMenuPosition
                  >${Object.values(menuPosition).map((menutype) => html`<mwc-list-item value="${menutype}"
                        >${translate("plugins." + menutype)}</mwc-list-item
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
                >${translate("plugins.validator")}<mwc-icon slot="meta"
                  >${pluginIcons["validator"]}</mwc-icon
                ></mwc-radio-list-item
              >
            </mwc-list>
            <mwc-textfield
              label="${translate("plugins.add.src")}"
              helper="${translate("plugins.add.srcHelper")}"
              placeholder="http://example.com/plugin.js"
              type="url"
              required
              id="pluginSrcInput"
            ></mwc-textfield>
          </div>
          <mwc-button
            slot="secondaryAction"
            dialogAction="close"
            label="${translate("cancel")}"
          ></mwc-button>
          <mwc-button
            slot="primaryAction"
            icon="add"
            label="${translate("add")}"
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
          heading="${translate("plugins.heading")}"
        >
          <mwc-list
            id="pluginList"
            multi
            @selected=${(e) => this.setPlugins(e.detail.index)}
          >
            <mwc-list-item graphic="avatar" noninteractive
              ><strong>${translate(`plugins.editor`)}</strong
              ><mwc-icon slot="graphic" class="inverted"
                >${pluginIcons["editor"]}</mwc-icon
              ></mwc-list-item
            >
            <li divider role="separator"></li>
            ${this.renderPluginKind("editor", this.plugins.filter((p) => p.kind === "editor"))}
            <mwc-list-item graphic="avatar" noninteractive
              ><strong>${translate(`plugins.menu`)}</strong
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
            label="${translate("reset")}"
            @click=${async () => {
        resetPlugins();
        this.requestUpdate();
      }}
            style="--mdc-theme-primary: var(--mdc-theme-error)"
          >
          </mwc-button>
          <mwc-button
            raised
            trailingIcon
            slot="primaryAction"
            icon="library_add"
            label="${translate("add")}&hellip;"
            @click=${() => this.pluginDownloadUI.show()}
          >
          </mwc-button>
        </mwc-dialog>
      `;
    }
    render() {
      return html`
        ${ifImplemented(super.render())} ${this.renderPluginUI()}
        ${this.renderDownloadUI()}
      `;
    }
  }
  __decorate([
    query("#pluginManager")
  ], PluggingElement.prototype, "pluginUI", 2);
  __decorate([
    query("#pluginList")
  ], PluggingElement.prototype, "pluginList", 2);
  __decorate([
    query("#pluginAdd")
  ], PluggingElement.prototype, "pluginDownloadUI", 2);
  return PluggingElement;
}
