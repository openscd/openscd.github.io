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
import {until} from "../_snowpack/pkg/lit-html/directives/until.js";
import {translate, get} from "../_snowpack/pkg/lit-translate.js";
import "../_snowpack/pkg/@material/mwc-button.js";
import "../_snowpack/pkg/@material/mwc-checkbox.js";
import "../_snowpack/pkg/@material/mwc-circular-progress-four-color.js";
import "../_snowpack/pkg/@material/mwc-dialog.js";
import "../_snowpack/pkg/@material/mwc-drawer.js";
import "../_snowpack/pkg/@material/mwc-fab.js";
import "../_snowpack/pkg/@material/mwc-formfield.js";
import "../_snowpack/pkg/@material/mwc-icon.js";
import "../_snowpack/pkg/@material/mwc-icon-button.js";
import "../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "../_snowpack/pkg/@material/mwc-linear-progress.js";
import "../_snowpack/pkg/@material/mwc-list.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../_snowpack/pkg/@material/mwc-list/mwc-radio-list-item.js";
import "../_snowpack/pkg/@material/mwc-menu.js";
import "../_snowpack/pkg/@material/mwc-select.js";
import "../_snowpack/pkg/@material/mwc-snackbar.js";
import "../_snowpack/pkg/@material/mwc-switch.js";
import "../_snowpack/pkg/@material/mwc-tab.js";
import "../_snowpack/pkg/@material/mwc-tab-bar.js";
import "../_snowpack/pkg/@material/mwc-textfield.js";
import "../_snowpack/pkg/@material/mwc-top-app-bar-fixed.js";
import "./filtered-list.js";
import {
  newLogEvent,
  newPendingStateEvent,
  newWizardEvent
} from "./foundation.js";
import {getTheme} from "./themes.js";
import {Editing, newEmptySCD} from "./Editing.js";
import {Importing} from "./Importing.js";
import {Logging} from "./Logging.js";
import {Setting} from "./Setting.js";
import {Plugging, pluginIcons} from "./Plugging.js";
import {Validating} from "./Validating.js";
import {Waiting} from "./Waiting.js";
import {Wizarding} from "./Wizarding.js";
export let OpenSCD = class extends Setting(Importing(Wizarding(Waiting(Validating(Plugging(Editing(Logging(LitElement)))))))) {
  constructor() {
    super();
    this.activeTab = 0;
    this.currentSrc = "";
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
  set srcIED(value) {
    this.dispatchEvent(newPendingStateEvent(this.importIED(value, this.doc)));
  }
  async loadIEDFile(event) {
    const file = event.target?.files?.item(0) ?? false;
    if (file) {
      const loaded = this.importIED(URL.createObjectURL(file), this.doc);
      this.dispatchEvent(newPendingStateEvent(loaded));
      await loaded;
    }
  }
  async loadDoc(src) {
    this.reset();
    this.dispatchEvent(newLogEvent({
      kind: "info",
      title: get("openSCD.loading", {name: this.docName})
    }));
    const response = await fetch(src);
    const text = await response.text();
    this.doc = new DOMParser().parseFromString(text, "application/xml");
    if (src.startsWith("blob:"))
      URL.revokeObjectURL(src);
    const validated = this.validate(this.doc, {fileName: this.docName});
    if (this.doc)
      this.dispatchEvent(newPendingStateEvent(validated));
    await validated;
    this.dispatchEvent(newLogEvent({
      kind: "info",
      title: get("openSCD.loaded", {name: this.docName})
    }));
    return;
  }
  loadFile(event) {
    const file = event.target?.files?.item(0) ?? false;
    if (file) {
      this.docName = file.name;
      this.setAttribute("src", URL.createObjectURL(file));
    }
  }
  saveAs() {
    this.docName = this.saveUI.querySelector("mwc-textfield")?.value || this.docName;
    this.save();
    this.saveUI.close();
  }
  formatXml(xml, tab) {
    let formatted = "", indent = "";
    if (!tab)
      tab = "	";
    xml.split(/>\s*</).forEach(function(node) {
      if (node.match(/^\/\w/))
        indent = indent.substring(tab.length);
      formatted += indent + "<" + node + ">\r\n";
      if (node.match(/^<?\w[^>]*[^/]$/))
        indent += tab;
    });
    return formatted.substring(1, formatted.length - 3);
  }
  save() {
    if (this.doc) {
      const blob = new Blob([this.formatXml(new XMLSerializer().serializeToString(this.doc))], {
        type: "application/xml"
      });
      const a = document.createElement("a");
      a.download = this.docName;
      a.href = URL.createObjectURL(blob);
      a.dataset.downloadurl = ["application/xml", a.download, a.href].join(":");
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 1500);
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
    if (ctrlAnd("s"))
      this.save();
    if (ctrlAnd("S"))
      this.saveUI.show();
    if (ctrlAnd("P"))
      this.pluginUI.show();
    if (handled)
      e.preventDefault();
  }
  createNewProject(inputs, wizard) {
    this.docName = inputs[0].value.match(/\.s[sc]d$/i) ? inputs[0].value : inputs[0].value + ".scd";
    const version = wizard.shadowRoot.querySelector("mwc-list").selected.value;
    this.reset();
    this.doc = newEmptySCD(this.docName.slice(0, -4), version);
    return [{actions: [], title: get("menu.new"), derived: true}];
  }
  newProjectWizard() {
    return [
      {
        title: get("menu.new"),
        primary: {
          icon: "create_new_folder",
          label: get("create"),
          action: (inputs, wizard) => this.createNewProject(inputs, wizard)
        },
        content: [
          html`<wizard-textfield
              id="srcName"
              label="name"
              value="project.scd"
              required
              dialogInitialFocus
            ></wizard-textfield>
            <mwc-list activatable>
              <mwc-radio-list-item left value="2003"
                >Edition 1 (Schema 1.7)</mwc-radio-list-item
              >
              <mwc-radio-list-item left value="2007B"
                >Edition 2 (Schema 3.1)</mwc-radio-list-item
              >
              <mwc-radio-list-item left selected value="2007B4"
                >Edition 2.1 (2007B4)</mwc-radio-list-item
              >
            </mwc-list>`
        ]
      }
    ];
  }
  openNewProjectWizard() {
    this.dispatchEvent(newWizardEvent(this.newProjectWizard()));
  }
  get menu() {
    const items = [];
    this.items.forEach((plugin) => items.push({
      icon: plugin.icon || pluginIcons["triggered"],
      name: plugin.name,
      action: (ae) => {
        this.dispatchEvent(newPendingStateEvent(ae.target.items[ae.detail.index].lastElementChild.trigger()));
      },
      disabled: () => this.doc === null,
      content: plugin.content
    }));
    if (items.length > 0)
      items.push("divider");
    return [
      "divider",
      {
        icon: "folder_open",
        name: "menu.open",
        action: () => this.fileUI.click()
      },
      {
        icon: "create_new_folder",
        name: "menu.new",
        action: () => this.openNewProjectWizard()
      },
      {
        icon: "save_alt",
        name: "save",
        action: () => this.save(),
        disabled: () => this.doc === null
      },
      {
        icon: "save",
        name: "saveAs",
        action: () => this.saveUI.show(),
        disabled: () => this.doc === null
      },
      {
        icon: "snippet_folder",
        name: "menu.importIED",
        action: () => this.iedImport.click(),
        disabled: () => this.doc === null
      },
      "divider",
      {
        icon: "undo",
        name: "undo",
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
      {
        icon: "rule_folder",
        name: "menu.validate",
        action: () => this.doc ? this.dispatchEvent(newPendingStateEvent(this.validate(this.doc, {fileName: this.docName}))) : null,
        disabled: () => this.doc === null
      },
      {
        icon: "rule",
        name: "menu.viewLog",
        actionItem: true,
        action: () => this.logUI.show()
      },
      "divider",
      ...items,
      {
        icon: "settings",
        name: "settings.name",
        action: () => this.settingsUI.show()
      },
      {
        icon: "extension",
        name: "plugins.heading",
        action: () => this.pluginUI.show()
      }
    ];
  }
  renderMenuItem(me) {
    if (me === "divider")
      return html`<li divider padded role="separator"></li>`;
    return html`
      <mwc-list-item
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
    return html`
      <mwc-drawer class="mdc-theme--surface" hasheader type="modal" id="menu">
        <span slot="title">${translate("menu.name")}</span>
        ${this.docName ? html`<span slot="subtitle">${this.docName}</span>` : ""}
        <mwc-list
          wrapFocus
          @action=${(ae) => this.menu.filter((item) => item !== "divider")[ae.detail.index]?.action?.(ae)}
        > ${this.menu.map(this.renderMenuItem)}
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

      <mwc-dialog heading="${translate("saveAs")}" id="saveas">
        <mwc-textfield dialogInitialFocus label="${translate("filename")}" value="${this.docName}">
        </mwc-textfield>
        <mwc-button
          @click=${() => this.saveAs()}
          icon="save"
          slot="primaryAction">
          ${translate("save")}
        </mwc-button>
        <mwc-button
          dialogAction="cancel"
          style="--mdc-theme-primary: var(--mdc-theme-error)"
          slot="secondaryAction">
          ${translate("cancel")}
        </mwc-button>
      </mwc-dialog>
        
      ${this.doc ? until(this.editors[this.activeTab] && this.editors[this.activeTab].content(), html`<mwc-linear-progress indeterminate></mwc-linear-progress>`) : html`<div class="landing">
              <mwc-icon-button
                class="landing_icon"
                icon="create_new_folder"
                @click=${() => this.openNewProjectWizard()}
              >
                <div class="landing_label">${translate("menu.new")}</div>
              </mwc-icon-button>
              <mwc-icon-button
                class="landing_icon"
                icon="folder_open"
                @click=${() => this.fileUI.click()}
              >
                <div class="landing_label">${translate("menu.open")}</div>
              </mwc-icon-button>
            </div>`}

      <input id="file-input" type="file" accept=".scd,.ssd" @click=${(event) => event.target.value = ""} @change="${this.loadFile}"></input>
      <input id="ied-import" type="file" accept=".icd,.iid,.cid" @click=${(event) => event.target.value = ""} @change="${this.loadIEDFile}"></input>
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
      background-color: var(--primary);
      --mdc-theme-primary: var(--mdc-theme-on-primary);
    }

    input[type='file'] {
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

    .landing {
      display: flex;
      flex-direction: row;
      justify-content: center;
      position: absolute;
      top: calc(50vh - 82px);
      left: calc(50vw - 184px);
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
  `;
__decorate([
  property({type: Number})
], OpenSCD.prototype, "activeTab", 2);
__decorate([
  property({type: String})
], OpenSCD.prototype, "src", 1);
__decorate([
  property({type: String})
], OpenSCD.prototype, "srcIED", 1);
__decorate([
  query("#menu")
], OpenSCD.prototype, "menuUI", 2);
__decorate([
  query("#file-input")
], OpenSCD.prototype, "fileUI", 2);
__decorate([
  query("#ied-import")
], OpenSCD.prototype, "iedImport", 2);
__decorate([
  query("#saveas")
], OpenSCD.prototype, "saveUI", 2);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
