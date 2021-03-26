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
export const pluginIcons = {
  editor: "tab",
  triggered: "play_circle"
};
const officialPlugins = fetch("/public/json/plugins.json").then((res) => res.json());
async function storeDefaultPlugins() {
  localStorage.setItem("plugins", JSON.stringify(await officialPlugins.then((plugins) => plugins.map((plugin) => {
    return {...plugin, installed: plugin.default ?? false};
  }))));
}
const loadedPlugins = new Map();
export function Plugging(Base) {
  class PluggingElement extends Base {
    get editors() {
      return this.plugins.filter((plugin) => plugin.installed && plugin.kind === "editor").map((plugin) => this.addContent(plugin));
    }
    get items() {
      return this.plugins.filter((plugin) => plugin.installed && plugin.kind === "triggered").map((plugin) => this.addContent(plugin));
    }
    setPlugins(indices) {
      const newPlugins = this.plugins.map((plugin, index) => {
        return {...plugin, installed: indices.has(index)};
      });
      localStorage.setItem("plugins", JSON.stringify(newPlugins));
      this.requestUpdate();
    }
    addPlugin(plugin) {
      if (this.plugins.some((p) => p.src === plugin.src))
        return;
      const newPlugins = this.plugins;
      newPlugins.push(plugin);
      localStorage.setItem("plugins", JSON.stringify(newPlugins));
    }
    get plugins() {
      return JSON.parse(localStorage.getItem("plugins") ?? "[]");
    }
    addContent(plugin) {
      return {
        ...plugin,
        installed: true,
        content: async () => {
          if (!loadedPlugins.has(plugin.src))
            loadedPlugins.set(plugin.src, await import(plugin.src).then((mod) => mod.default));
          return html`<${loadedPlugins.get(plugin.src)}
            .doc=${this.doc}
            .docName=${this.docName}
          ></${loadedPlugins.get(plugin.src)}>`;
        }
      };
    }
    handleAddPlugin() {
      const pluginSrcInput = this.pluginDownloadUI.querySelector("#pluginSrcInput");
      const pluginNameInput = this.pluginDownloadUI.querySelector("#pluginNameInput");
      const pluginKindList = this.pluginDownloadUI.querySelector("#pluginKindList");
      if (!(pluginSrcInput.checkValidity() && pluginNameInput.checkValidity() && pluginKindList.selected))
        return;
      this.addPlugin({
        src: pluginSrcInput.value,
        name: pluginNameInput.value,
        kind: pluginKindList.selected.value,
        installed: true
      });
      this.requestUpdate();
      this.pluginUI.requestUpdate();
      this.pluginDownloadUI.close();
    }
    constructor(...args) {
      super(...args);
      if (localStorage.getItem("plugins") === null)
        storeDefaultPlugins().then(() => this.requestUpdate());
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
              <mwc-radio-list-item value="editor" hasMeta selected left
                >${translate("plugins.editor")}<mwc-icon slot="meta"
                  >${pluginIcons["editor"]}</mwc-icon
                ></mwc-radio-list-item
              >
              <mwc-radio-list-item value="triggered" hasMeta left
                >${translate("plugins.triggered")}<mwc-icon slot="meta"
                  >${pluginIcons["triggered"]}</mwc-icon
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
    renderPluginUI() {
      return html`
        <mwc-dialog
          stacked
          id="pluginManager"
          heading="${translate("plugins.heading")}"
        >
          <mwc-list
            @selected=${(e) => this.setPlugins(e.detail.index)}
            id="pluginList"
            activatable
            multi
          >
            ${this.plugins.map((plugin) => html`<mwc-list-item
                  value="${plugin.src}"
                  hasMeta
                  graphic="icon"
                  ?activated=${plugin.installed}
                  ?selected=${plugin.installed}
                >
                  <mwc-icon slot="graphic"
                    >${plugin.icon || pluginIcons[plugin.kind]}</mwc-icon
                  >
                  ${plugin.name}
                  <mwc-icon slot="meta"
                    >${pluginIcons[plugin.kind]}</mwc-icon
                  ></mwc-list-item
                >`)}
          </mwc-list>
          <mwc-button
            slot="secondaryAction"
            icon="refresh"
            label="${translate("reset")}"
            @click=${async () => {
        storeDefaultPlugins();
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
