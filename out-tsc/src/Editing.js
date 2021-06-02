import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { LitElement, property } from '../../_snowpack/pkg/lit-element.js';
import { get } from '../../_snowpack/pkg/lit-translate.js';
import { isCreate, isDelete, isMove, isSimple, isUpdate, newLogEvent, } from './foundation.js';
import { supportedAttributes } from './schemas.js';
/** Returns a new empty SCD document. */
export function newEmptySCD(id, versionId) {
    const { version, revision, release } = supportedAttributes[versionId];
    const markup = `<?xml version="1.0" encoding="UTF-8"?>
    <SCL xmlns="http://www.iec.ch/61850/2003/SCL" ${version ? `version="${version}"` : ''} ${revision ? `revision="${revision}"` : ''} ${release ? `release="${release}"` : ''}>
      <Header id="${id}"/>
    </SCL>`;
    return new DOMParser().parseFromString(markup, 'application/xml');
}
/** @typeParam TBase - a type extending `LitElement`
 * @returns `Base` with an `XMLDocument` property "`doc`" and an event listener
 * applying [[`EditorActionEvent`]]s and dispatching [[`LogEvent`]]s. */
export function Editing(Base) {
    class EditingElement extends Base {
        constructor(...args) {
            super(...args);
            /** The `XMLDocument` to be edited */
            this.doc = null;
            /** The name of the current [[`doc`]] */
            this.docName = '';
            this.addEventListener('editor-action', this.onAction);
        }
        checkCreateValidity(create) {
            if (create.checkValidity !== undefined)
                return create.checkValidity();
            const invalid = create.new.element.hasAttribute('name') &&
                Array.from(create.new.parent.children).some(elm => elm.tagName === create.new.element.tagName &&
                    elm.getAttribute('name') === create.new.element.getAttribute('name'));
            if (invalid)
                this.dispatchEvent(newLogEvent({
                    kind: 'error',
                    title: get('editing.error.create', {
                        name: create.new.element.tagName,
                    }),
                    message: get('editing.error.nameClash', {
                        parent: create.new.parent instanceof HTMLElement
                            ? create.new.parent.tagName
                            : 'Document',
                        child: create.new.element.tagName,
                        name: create.new.element.getAttribute('name'),
                    }),
                }));
            return !invalid;
        }
        onCreate(action) {
            if (!this.checkCreateValidity(action))
                return false;
            action.new.parent.insertBefore(action.new.element, action.new.reference);
            return true;
        }
        logCreate(action) {
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.created', {
                    name: action.new.element.tagName,
                }),
                action: action,
            }));
        }
        onDelete(action) {
            action.old.element.remove();
            return true;
        }
        logDelete(action) {
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.deleted', {
                    name: action.old.element.tagName,
                }),
                action: action,
            }));
        }
        checkMoveValidity(move) {
            if (move.checkValidity !== undefined)
                return move.checkValidity();
            const invalid = move.old.element.hasAttribute('name') &&
                move.new.parent !== move.old.parent &&
                Array.from(move.new.parent.children).some(elm => elm.tagName === move.old.element.tagName &&
                    elm.getAttribute('name') === move.old.element.getAttribute('name'));
            if (invalid)
                this.dispatchEvent(newLogEvent({
                    kind: 'error',
                    title: get('editing.error.move', {
                        name: move.old.element.tagName,
                    }),
                    message: get('editing.error.nameClash', {
                        parent: move.new.parent.tagName,
                        child: move.old.element.tagName,
                        name: move.old.element.getAttribute('name'),
                    }),
                }));
            return !invalid;
        }
        onMove(action) {
            if (!this.checkMoveValidity(action))
                return false;
            action.new.parent.insertBefore(action.old.element, action.new.reference);
            return true;
        }
        logMove(action) {
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.moved', {
                    name: action.old.element.tagName,
                }),
                action: action,
            }));
        }
        checkUpdateValidity(update) {
            if (update.checkValidity !== undefined)
                return update.checkValidity();
            const invalid = update.new.element.hasAttribute('name') &&
                update.new.element.getAttribute('name') !==
                    update.old.element.getAttribute('name') &&
                Array.from(update.old.element.parentElement?.children ?? []).some(elm => elm.tagName === update.new.element.tagName &&
                    elm.getAttribute('name') === update.new.element.getAttribute('name'));
            if (invalid)
                this.dispatchEvent(newLogEvent({
                    kind: 'error',
                    title: get('editing.error.update', {
                        name: update.new.element.tagName,
                    }),
                    message: get('editing.error.nameClash', {
                        parent: update.old.element.parentElement.tagName,
                        child: update.new.element.tagName,
                        name: update.new.element.getAttribute('name'),
                    }),
                }));
            return !invalid;
        }
        onUpdate(action) {
            if (!this.checkUpdateValidity(action))
                return false;
            action.new.element.append(...Array.from(action.old.element.children));
            action.old.element.replaceWith(action.new.element);
            return true;
        }
        logUpdate(action) {
            this.dispatchEvent(newLogEvent({
                kind: 'action',
                title: get('editing.updated', {
                    name: action.new.element.tagName,
                }),
                action: action,
            }));
        }
        onSimpleAction(action) {
            if (isMove(action))
                return this.onMove(action);
            else if (isCreate(action))
                return this.onCreate(action);
            else if (isDelete(action))
                return this.onDelete(action);
            else if (isUpdate(action))
                return this.onUpdate(action);
        }
        logSimpleAction(action) {
            if (isMove(action))
                this.logMove(action);
            else if (isCreate(action))
                this.logCreate(action);
            else if (isDelete(action))
                this.logDelete(action);
            else if (isUpdate(action))
                this.logUpdate(action);
        }
        onAction(event) {
            if (isSimple(event.detail.action)) {
                if (this.onSimpleAction(event.detail.action))
                    this.logSimpleAction(event.detail.action);
            }
            else if (event.detail.action.actions.length > 0) {
                event.detail.action.actions.forEach(element => this.onSimpleAction(element));
                this.dispatchEvent(newLogEvent({
                    kind: 'action',
                    title: event.detail.action.title,
                    action: event.detail.action,
                }));
            }
            for (const element of event.composedPath())
                if (element instanceof LitElement)
                    element.requestUpdate();
        }
    }
    __decorate([
        property()
    ], EditingElement.prototype, "doc", void 0);
    __decorate([
        property({ type: String })
    ], EditingElement.prototype, "docName", void 0);
    return EditingElement;
}
//# sourceMappingURL=Editing.js.map