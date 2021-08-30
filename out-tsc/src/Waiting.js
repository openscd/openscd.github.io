import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { html, property } from '../../_snowpack/pkg/lit-element.js';
import { ifImplemented, } from './foundation.js';
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
            await e.detail.promise.catch(reason => console.warn(reason));
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