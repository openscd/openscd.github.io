import { __decorate } from "../../web_modules/tslib.js";
import { html, property } from '../../web_modules/lit-element.js';
import '../../web_modules/@material/mwc-circular-progress-four-color.js';
import { ifImplemented, newLogEvent, } from './foundation.js';
export function Waiting(Base) {
    class WaitingElement extends Base {
        constructor(...args) {
            super(...args);
            /** Whether the element is currently waiting for some async work. */
            this.waiting = false;
            this.work = new Set();
            /** A promise which resolves once all currently pending work is done. */
            this.workDone = Promise.allSettled(this.work);
            this.onPendingState = this.onPendingState.bind(this);
            this.addEventListener('pending-state', this.onPendingState);
        }
        async onPendingState(e) {
            this.waiting = true;
            this.work.add(e.detail.promise);
            this.workDone = Promise.allSettled(this.work);
            await e.detail.promise.then(msg => this.dispatchEvent(newLogEvent({ kind: 'info', title: msg })), msg => this.dispatchEvent(newLogEvent({ kind: 'warning', title: msg })));
            this.work.delete(e.detail.promise);
            this.waiting = this.work.size > 0;
        }
        render() {
            return html `${ifImplemented(super.render())}
        <mwc-circular-progress-four-color
          .closed=${!this.waiting}
          indeterminate
        ></mwc-circular-progress-four-color>`;
        }
    }
    __decorate([
        property({ type: Boolean })
    ], WaitingElement.prototype, "waiting", void 0);
    return WaitingElement;
}
//# sourceMappingURL=Waiting.js.map