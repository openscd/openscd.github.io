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
  property
} from "../_snowpack/pkg/lit-element.js";
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
import {newOpenDocEvent, newPendingStateEvent} from "./foundation.js";
import {getTheme} from "./themes.js";
import {Editing} from "./Editing.js";
import {Hosting} from "./Hosting.js";
import {Logging} from "./Logging.js";
import {Plugging} from "./Plugging.js";
import {Setting} from "./Setting.js";
import {Waiting} from "./Waiting.js";
import {Wizarding} from "./Wizarding.js";
export let OpenSCD = class extends Hosting(Setting(Wizarding(Waiting(Plugging(Editing(Logging(LitElement))))))) {
  constructor() {
    super();
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
  render() {
    return html` ${super.render()} ${getTheme(this.settings.theme)} `;
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

    mwc-circular-progress-four-color {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
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
  property({type: String})
], OpenSCD.prototype, "src", 1);
OpenSCD = __decorate([
  customElement("open-scd")
], OpenSCD);
