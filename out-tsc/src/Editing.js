import { __decorate } from "../../web_modules/tslib.js";
import { isCreate, isDelete, isMove, isUpdate, newLogEvent, } from './foundation.js';
import { LitElement, property } from '../../web_modules/lit-element.js';
import { get } from '../../web_modules/lit-translate.js';
export function newEmptySCD() {
    return document.implementation.createDocument('http://www.iec.ch/61850/2003/SCL', 'SCL', null);
}
export function Editing(Base) {
    class EditingElement extends Base {
        constructor(...args) {
            super(...args);
            /** The `XMLDocument` being edited. */
            this.doc = newEmptySCD();
            this.addEventListener('editor-action', this.onAction);
        }
        onCreate(event) {
            event.detail.action.new.parent.insertBefore(event.detail.action.new.element, event.detail.action.new.reference);
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.created', {
                    name: event.detail.action.new.element.tagName,
                }),
                action: event.detail.action,
            }));
        }
        onDelete(event) {
            event.detail.action.old.element.remove();
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.deleted', {
                    name: event.detail.action.old.element.tagName,
                }),
                action: event.detail.action,
            }));
        }
        onMove(event) {
            event.detail.action.new.parent.insertBefore(event.detail.action.old.element, event.detail.action.new.reference);
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.moved', {
                    name: event.detail.action.old.element.tagName,
                }),
                action: event.detail.action,
            }));
        }
        onUpdate(event) {
            event.detail.action.new.element.append(...Array.from(event.detail.action.old.element.children));
            event.detail.action.old.element.replaceWith(event.detail.action.new.element);
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.updated', {
                    name: event.detail.action.new.element.tagName,
                }),
                action: event.detail.action,
            }));
        }
        onAction(event) {
            if (isMove(event.detail.action))
                this.onMove(event);
            else if (isCreate(event.detail.action))
                this.onCreate(event);
            else if (isDelete(event.detail.action))
                this.onDelete(event);
            else if (isUpdate(event.detail.action))
                this.onUpdate(event);
            for (const element of event.composedPath())
                if (element instanceof LitElement)
                    element.requestUpdate();
        }
    }
    __decorate([
        property()
    ], EditingElement.prototype, "doc", void 0);
    return EditingElement;
}
//# sourceMappingURL=Editing.js.map