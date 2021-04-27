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
import {ifDefined} from "../_snowpack/pkg/lit-html/directives/if-defined.js";
import {
  ifImplemented,
  invert,
  newActionEvent
} from "./foundation.js";
import {get, translate} from "../_snowpack/pkg/lit-translate.js";
import {getFilterIcon, iconColors} from "./icons.js";
const icons = {
  info: "info",
  warning: "warning",
  error: "report",
  action: "history"
};
export function Logging(Base) {
  class LoggingElement extends Base {
    constructor(...args) {
      super(...args);
      this.history = [];
      this.currentAction = -1;
      this.undo = this.undo.bind(this);
      this.redo = this.redo.bind(this);
      this.onLog = this.onLog.bind(this);
      this.addEventListener("log", this.onLog);
    }
    get canUndo() {
      return this.currentAction >= 0;
    }
    get canRedo() {
      return this.nextAction >= 0;
    }
    get previousAction() {
      if (!this.canUndo)
        return -1;
      return this.history.slice(0, this.currentAction).map((entry) => entry.kind == "action" ? true : false).lastIndexOf(true);
    }
    get nextAction() {
      let index = this.history.slice(this.currentAction + 1).findIndex((entry) => entry.kind == "action");
      if (index >= 0)
        index += this.currentAction + 1;
      return index;
    }
    undo() {
      if (!this.canUndo)
        return false;
      this.dispatchEvent(newActionEvent(invert(this.history[this.currentAction].action)));
      this.currentAction = this.previousAction;
      return true;
    }
    redo() {
      if (!this.canRedo)
        return false;
      this.dispatchEvent(newActionEvent(this.history[this.nextAction].action));
      this.currentAction = this.nextAction;
      return true;
    }
    reset() {
      this.history = [];
      this.currentAction = -1;
    }
    onLog(le) {
      const entry = {
        time: new Date(),
        ...le.detail
      };
      if (entry.kind == "action") {
        if (entry.action.derived)
          return;
        entry.action.derived = true;
        if (this.nextAction !== -1)
          this.history.splice(this.nextAction);
        this.currentAction = this.history.length;
      }
      this.history.push(entry);
      if (!this.logUI.open) {
        const ui = {
          error: this.errorUI,
          warning: this.warningUI,
          info: this.infoUI,
          action: this.infoUI
        }[le.detail.kind];
        ui.close();
        ui.show();
      }
      if (le.detail.kind == "error") {
        this.errorUI.close();
        this.errorUI.show();
      }
      this.requestUpdate("history", []);
    }
    async performUpdate() {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      super.performUpdate();
    }
    renderLogEntry(entry, index, history) {
      return html` <abbr title="${entry.title}">
        <mwc-list-item
          class="${entry.kind}"
          graphic="icon"
          ?twoline=${!!entry.message}
          ?activated=${this.currentAction == history.length - index - 1}
        >
          <span>
            <!-- FIXME: replace tt with mwc-chip asap -->
            <tt>${entry.time.toLocaleTimeString()}</tt>
            ${entry.title}</span
          >
          <span slot="secondary">${entry.message}</span>
          <mwc-icon
            slot="graphic"
            style="--mdc-theme-text-icon-on-background:var(${ifDefined(iconColors[entry.kind])})"
            >${icons[entry.kind]}</mwc-icon
          >
        </mwc-list-item></abbr
      >`;
    }
    renderHistory() {
      if (this.history.length > 0)
        return this.history.slice().reverse().map(this.renderLogEntry, this);
      else
        return html`<mwc-list-item disabled graphic="icon">
          <span>${translate("log.placeholder")}</span>
          <mwc-icon slot="graphic">info</mwc-icon>
        </mwc-list-item>`;
    }
    renderFilterButtons() {
      return Object.keys(icons).map((kind) => html`<mwc-icon-button-toggle id="${kind}filter" on
          >${getFilterIcon(kind, false)}
          ${getFilterIcon(kind, true)}</mwc-icon-button-toggle
        >`);
    }
    render() {
      return html`${ifImplemented(super.render())}
        <style>
          #log > mwc-icon-button-toggle {
            position: absolute;
            top: 8px;
            right: 14px;
          }
          #log > mwc-icon-button-toggle:nth-child(2) {
            right: 62px;
          }
          #log > mwc-icon-button-toggle:nth-child(3) {
            right: 110px;
          }
          #log > mwc-icon-button-toggle:nth-child(4) {
            right: 158px;
          }
          #content mwc-list-item.info,
          #content mwc-list-item.warning,
          #content mwc-list-item.error,
          #content mwc-list-item.action {
            display: none;
          }
          #infofilter[on] ~ #content mwc-list-item.info {
            display: flex;
          }
          #warningfilter[on] ~ #content mwc-list-item.warning {
            display: flex;
          }
          #errorfilter[on] ~ #content mwc-list-item.error {
            display: flex;
          }
          #actionfilter[on] ~ #content mwc-list-item.action {
            display: flex;
          }

          #log {
            --mdc-dialog-min-width: 92vw;
          }

          #log > #filterContainer {
            position: absolute;
            top: 14px;
            right: 14px;
          }
        </style>
        <mwc-dialog id="log" heading="${translate("log.name")}">
          ${this.renderFilterButtons()}
          <mwc-list id="content" wrapFocus>${this.renderHistory()}</mwc-list>
          <mwc-button
            icon="undo"
            label="${translate("undo")}"
            ?disabled=${!this.canUndo}
            @click=${this.undo}
            slot="secondaryAction"
          ></mwc-button>
          <mwc-button
            icon="redo"
            label="${translate("redo")}"
            ?disabled=${!this.canRedo}
            @click=${this.redo}
            slot="secondaryAction"
          ></mwc-button>
          <mwc-button slot="primaryAction" dialogaction="close"
            >${translate("close")}</mwc-button
          >
        </mwc-dialog>

        <mwc-snackbar
          id="info"
          timeoutMs="2000"
          labelText="${this.history.slice().reverse().find((le) => le.kind === "info" || le.kind === "action")?.title ?? get("log.snackbar.placeholder")}"
        >
          <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>
        <mwc-snackbar
          id="warning"
          timeoutMs="5000"
          labelText="${this.history.slice().reverse().find((le) => le.kind === "warning")?.title ?? get("log.snackbar.placeholder")}"
        >
          <mwc-button
            slot="action"
            icon="rule"
            @click=${() => this.logUI.show()}
            >${translate("log.snackbar.show")}</mwc-button
          >
          <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>
        <mwc-snackbar
          id="error"
          timeoutMs="10000"
          labelText="${this.history.slice().reverse().find((le) => le.kind === "error")?.title ?? get("log.snackbar.placeholder")}"
        >
          <mwc-button
            slot="action"
            icon="rule"
            @click=${() => this.logUI.show()}
            >${translate("log.snackbar.show")}</mwc-button
          >
          <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>`;
    }
  }
  __decorate([
    property({type: Array})
  ], LoggingElement.prototype, "history", 2);
  __decorate([
    property({type: Number})
  ], LoggingElement.prototype, "currentAction", 2);
  __decorate([
    query("#log")
  ], LoggingElement.prototype, "logUI", 2);
  __decorate([
    query("#error")
  ], LoggingElement.prototype, "errorUI", 2);
  __decorate([
    query("#warning")
  ], LoggingElement.prototype, "warningUI", 2);
  __decorate([
    query("#info")
  ], LoggingElement.prototype, "infoUI", 2);
  return LoggingElement;
}
