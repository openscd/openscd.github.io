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
import {html, property, query} from "../_snowpack/pkg/lit-element.js";
import {until} from "../_snowpack/pkg/lit-html/directives/until.js";
import {translate} from "../_snowpack/pkg/lit-translate.js";
import {newPendingStateEvent} from "./foundation.js";
import {pluginIcons} from "./Plugging.js";
export function Hosting(Base) {
  class HostingElement extends Base {
    constructor(...args) {
      super(...args);
      this.activeTab = 0;
      this.validated = Promise.resolve();
      this.addEventListener("validate", async (e) => {
        this.validated = Promise.allSettled(this.menuUI.querySelector("mwc-list").items.filter((item) => item.className === "validator").map((item) => {
          const promise = item.lastElementChild.validate(e.detail.identity);
          return promise;
        }));
      });
    }
    get menu() {
      const triggered = [];
      const loaders = [];
      const savers = [];
      const validators = [];
      this.triggered.forEach((plugin) => triggered.push({
        icon: plugin.icon || pluginIcons["triggered"],
        name: plugin.name,
        action: (ae) => {
          this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].lastElementChild.trigger()));
        },
        disabled: () => this.doc === null,
        content: plugin.content,
        kind: "triggered"
      }));
      this.loaders.forEach((plugin) => loaders.push({
        icon: plugin.icon || pluginIcons["loader"],
        name: plugin.name,
        action: (ae) => {
          this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].lastElementChild.load()));
        },
        disabled: () => false,
        content: plugin.content,
        kind: "loader"
      }));
      this.savers.forEach((plugin) => savers.push({
        icon: plugin.icon || pluginIcons["saver"],
        name: plugin.name,
        action: (ae) => {
          this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].lastElementChild.save()));
        },
        disabled: () => this.doc === null,
        content: plugin.content,
        kind: "saver"
      }));
      this.validators.forEach((plugin) => validators.push({
        icon: plugin.icon || pluginIcons["validator"],
        name: plugin.name,
        action: (ae) => {
          this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].lastElementChild.validate("")));
        },
        disabled: () => this.doc === null,
        content: plugin.content,
        kind: "validator"
      }));
      if (triggered.length > 0)
        triggered.push("divider");
      return [
        "divider",
        ...loaders,
        ...savers,
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
          icon: "rule",
          name: "menu.viewLog",
          actionItem: true,
          action: () => this.logUI.show(),
          kind: "static"
        },
        "divider",
        ...triggered,
        {
          icon: "settings",
          name: "settings.name",
          action: () => this.settingsUI.show(),
          kind: "static"
        },
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
      return html`
        <mwc-list-item
          class="${me.kind}"
          iconid="${me.icon}"
          graphic="icon"
          .disabled=${me.disabled?.() || !me.action}
          ><mwc-icon slot="graphic">${me.icon}</mwc-icon>
          <span>${translate(me.name)}</span>
          ${me.hint ? html`<span slot="secondary"><tt>${me.hint}</tt></span>` : ""}
          ${me.content ? until(me.content(), html`<mwc-linear-progress indeterminate></mwc-linear-progress>`) : ""}
        </mwc-list-item>
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
    render() {
      return html` <mwc-drawer
          class="mdc-theme--surface"
          hasheader
          type="modal"
          id="menu"
        >
          <span slot="title">${translate("menu.name")}</span>
          ${this.docName ? html`<span slot="subtitle">${this.docName}</span>` : ""}
          <mwc-list
            wrapFocus
            @action=${(ae) => this.menu.filter((item) => item !== "divider")[ae.detail.index]?.action?.(ae)}
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

        ${this.doc ? until(this.editors[this.activeTab] && this.editors[this.activeTab].content(), html`<mwc-linear-progress indeterminate></mwc-linear-progress>`) : html`<div class="landing">
              ${this.menu.filter((mi) => mi !== "divider").map((mi, index) => mi.kind === "loader" ? html`
                        <mwc-icon-button
                          class="landing_icon"
                          icon="${mi.icon}"
                          @click="${() => this.menuUI.querySelector("mwc-list").items[index].click()}"
                        >
                          <div class="landing_label">${mi.name}</div>
                        </mwc-icon-button>
                      ` : html``)}
            </div>`}
        ${super.render()}`;
    }
  }
  __decorate([
    property({type: Number})
  ], HostingElement.prototype, "activeTab", 2);
  __decorate([
    property({attribute: false})
  ], HostingElement.prototype, "validated", 2);
  __decorate([
    query("#menu")
  ], HostingElement.prototype, "menuUI", 2);
  return HostingElement;
}
