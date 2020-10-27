import { __decorate } from "../../web_modules/tslib.js";
import { html, property, query } from '../../web_modules/lit-element.js';
import { ifDefined } from '../../web_modules/lit-html/directives/if-defined.js';
import '../../web_modules/@material/mwc-button.js';
import '../../web_modules/@material/mwc-dialog.js';
import '../../web_modules/@material/mwc-icon.js';
import '../../web_modules/@material/mwc-icon-button.js';
import '../../web_modules/@material/mwc-list.js';
import '../../web_modules/@material/mwc-list/mwc-list-item.js';
import '../../web_modules/@material/mwc-snackbar.js';
import { ifImplemented, invert, newActionEvent, } from './foundation.js';
import { get, translate } from '../../web_modules/lit-translate.js';
const icons = {
    info: 'info',
    warning: 'warning',
    error: 'report',
    action: 'history',
};
const colors = {
    info: '--cyan',
    warning: '--yellow',
    error: '--red',
    action: undefined,
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
            this.addEventListener('log', this.onLog);
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
            return this.history
                .slice(0, this.currentAction)
                .map(entry => (entry.kind == 'action' ? true : false))
                .lastIndexOf(true);
        }
        get nextAction() {
            let index = this.history
                .slice(this.currentAction + 1)
                .findIndex(entry => entry.kind == 'action');
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
                ...le.detail,
            };
            if (entry.kind == 'action') {
                if (entry.action.derived)
                    return;
                entry.action.derived = true;
                if (this.nextAction !== -1)
                    this.history.splice(this.nextAction);
                this.currentAction = this.history.length;
            }
            this.history.push(entry);
            if (le.detail.kind == 'error')
                this.messageUI.show();
        }
        renderLogEntry(entry, index, history) {
            return html `<mwc-list-item
        graphic="icon"
        style="--mdc-theme-text-icon-on-background:var(${ifDefined(colors[entry.kind])})"
        ?twoline=${entry.message}
        ?activated=${this.currentAction == history.length - index - 1}
      >
        <span>
          <!-- FIXME: replace tt with mwc-chip asap -->
          <tt>${entry.time.toLocaleTimeString()}</tt>
          ${entry.title}</span
        >
        <span slot="secondary">${entry.message}</span>
        <mwc-icon slot="graphic">${icons[entry.kind]}</mwc-icon>
      </mwc-list-item>`;
        }
        renderHistory() {
            if (this.history.length > 0)
                return this.history.slice().reverse().map(this.renderLogEntry, this);
            else
                return html `<mwc-list-item disabled graphic="icon">
          <span>${translate('log.placeholder')}</span>
          <mwc-icon slot="graphic">info</mwc-icon>
        </mwc-list-item>`;
        }
        render() {
            return html `${ifImplemented(super.render())}
        <mwc-dialog id="log" heading="${translate('log.name')}">
          <mwc-list id="content" wrapFocus>${this.renderHistory()}</mwc-list>
          <mwc-button
            icon="undo"
            label="${translate('undo')}"
            ?disabled=${!this.canUndo}
            @click=${this.undo}
            slot="secondaryAction"
          ></mwc-button>
          <mwc-button
            icon="redo"
            label="${translate('redo')}"
            ?disabled=${!this.canRedo}
            @click=${this.redo}
            slot="secondaryAction"
          ></mwc-button>
          <mwc-button slot="primaryAction" dialogaction="close"
            >${translate('close')}</mwc-button
          >
        </mwc-dialog>

        <mwc-snackbar
          id="message"
          timeoutMs="-1"
          labelText="${this.history
                .slice()
                .reverse()
                .find(le => le.kind == 'error')?.title ??
                get('log.snackbar.placeholder')}"
        >
          <mwc-button
            slot="action"
            icon="rule"
            @click=${() => this.logUI.show()}
            >${translate('log.snackbar.show')}</mwc-button
          >
          <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>`;
        }
    }
    __decorate([
        property()
    ], LoggingElement.prototype, "history", void 0);
    __decorate([
        query('#log')
    ], LoggingElement.prototype, "logUI", void 0);
    __decorate([
        query('#message')
    ], LoggingElement.prototype, "messageUI", void 0);
    return LoggingElement;
}
//# sourceMappingURL=Logging.js.map