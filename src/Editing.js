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
import {LitElement, property} from "../_snowpack/pkg/lit-element.js";
import {get} from "../_snowpack/pkg/lit-translate.js";
import {
  isCreate,
  isDelete,
  isMove,
  isSimple,
  isUpdate,
  newLogEvent,
  newValidateEvent
} from "./foundation.js";
export function Editing(Base) {
  class EditingElement extends Base {
    constructor(...args) {
      super(...args);
      this.doc = null;
      this.docName = "";
      this.docId = "";
      this.addEventListener("editor-action", this.onAction);
      this.addEventListener("open-doc", this.onOpenDoc);
    }
    checkCreateValidity(create) {
      if (create.checkValidity !== void 0)
        return create.checkValidity();
      const invalid = create.new.element.hasAttribute("name") && Array.from(create.new.parent.children).some((elm) => elm.tagName === create.new.element.tagName && elm.getAttribute("name") === create.new.element.getAttribute("name"));
      if (invalid)
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("editing.error.create", {
            name: create.new.element.tagName
          }),
          message: get("editing.error.nameClash", {
            parent: create.new.parent instanceof HTMLElement ? create.new.parent.tagName : "Document",
            child: create.new.element.tagName,
            name: create.new.element.getAttribute("name")
          })
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
        kind: "action",
        title: get("editing.created", {
          name: action.new.element.tagName
        }),
        action
      }));
    }
    onDelete(action) {
      action.old.element.remove();
      return true;
    }
    logDelete(action) {
      this.dispatchEvent(newLogEvent({
        kind: "action",
        title: get("editing.deleted", {
          name: action.old.element.tagName
        }),
        action
      }));
    }
    checkMoveValidity(move) {
      if (move.checkValidity !== void 0)
        return move.checkValidity();
      const invalid = move.old.element.hasAttribute("name") && move.new.parent !== move.old.parent && Array.from(move.new.parent.children).some((elm) => elm.tagName === move.old.element.tagName && elm.getAttribute("name") === move.old.element.getAttribute("name"));
      if (invalid)
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("editing.error.move", {
            name: move.old.element.tagName
          }),
          message: get("editing.error.nameClash", {
            parent: move.new.parent.tagName,
            child: move.old.element.tagName,
            name: move.old.element.getAttribute("name")
          })
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
        kind: "action",
        title: get("editing.moved", {
          name: action.old.element.tagName
        }),
        action
      }));
    }
    checkUpdateValidity(update) {
      if (update.checkValidity !== void 0)
        return update.checkValidity();
      const invalid = update.new.element.hasAttribute("name") && update.new.element.getAttribute("name") !== update.old.element.getAttribute("name") && Array.from(update.old.element.parentElement?.children ?? []).some((elm) => elm.tagName === update.new.element.tagName && elm.getAttribute("name") === update.new.element.getAttribute("name"));
      if (invalid)
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("editing.error.update", {
            name: update.new.element.tagName
          }),
          message: get("editing.error.nameClash", {
            parent: update.old.element.parentElement.tagName,
            child: update.new.element.tagName,
            name: update.new.element.getAttribute("name")
          })
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
        kind: "action",
        title: get("editing.updated", {
          name: action.new.element.tagName
        }),
        action
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
      } else if (event.detail.action.actions.length > 0) {
        event.detail.action.actions.forEach((element) => this.onSimpleAction(element));
        this.dispatchEvent(newLogEvent({
          kind: "action",
          title: event.detail.action.title,
          action: event.detail.action
        }));
      }
      this.dispatchEvent(newValidateEvent());
      for (const element of event.composedPath())
        if (element instanceof LitElement)
          element.requestUpdate();
    }
    async onOpenDoc(event) {
      this.doc = event.detail.doc;
      this.docName = event.detail.docName;
      this.docId = event.detail.docId ?? "";
      await this.updateComplete;
      this.dispatchEvent(newValidateEvent());
      this.dispatchEvent(newLogEvent({
        kind: "info",
        title: get("openSCD.loaded", {name: this.docName})
      }));
    }
  }
  __decorate([
    property({attribute: false})
  ], EditingElement.prototype, "doc", 2);
  __decorate([
    property({type: String})
  ], EditingElement.prototype, "docName", 2);
  __decorate([
    property({type: String})
  ], EditingElement.prototype, "docId", 2);
  return EditingElement;
}
