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
import {LitElement, property} from "../web_modules/lit-element.js";
import {get} from "../web_modules/lit-translate.js";
import {
  isCreate,
  isDelete,
  isMove,
  isUpdate,
  newLogEvent
} from "./foundation.js";
export function newEmptySCD() {
  return document.implementation.createDocument("http://www.iec.ch/61850/2003/SCL", "SCL", null);
}
export function Editing(Base) {
  class EditingElement extends Base {
    constructor(...args) {
      super(...args);
      this.doc = newEmptySCD();
      this.addEventListener("editor-action", this.onAction);
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
            parent: create.new.parent.tagName,
            child: create.new.element.tagName,
            name: create.new.element.getAttribute("name")
          })
        }));
      return !invalid;
    }
    onCreate(event) {
      if (!this.checkCreateValidity(event.detail.action))
        return;
      event.detail.action.new.parent.insertBefore(event.detail.action.new.element, event.detail.action.new.reference);
      this.dispatchEvent(newLogEvent({
        kind: "action",
        title: get("editing.created", {
          name: event.detail.action.new.element.tagName
        }),
        action: event.detail.action
      }));
    }
    onDelete(event) {
      event.detail.action.old.element.remove();
      this.dispatchEvent(newLogEvent({
        kind: "action",
        title: get("editing.deleted", {
          name: event.detail.action.old.element.tagName
        }),
        action: event.detail.action
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
    onMove(event) {
      if (!this.checkMoveValidity(event.detail.action))
        return;
      event.detail.action.new.parent.insertBefore(event.detail.action.old.element, event.detail.action.new.reference);
      this.dispatchEvent(newLogEvent({
        kind: "action",
        title: get("editing.moved", {
          name: event.detail.action.old.element.tagName
        }),
        action: event.detail.action
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
    onUpdate(event) {
      if (!this.checkUpdateValidity(event.detail.action))
        return;
      event.detail.action.new.element.append(...Array.from(event.detail.action.old.element.children));
      event.detail.action.old.element.replaceWith(event.detail.action.new.element);
      this.dispatchEvent(newLogEvent({
        kind: "action",
        title: get("editing.updated", {
          name: event.detail.action.new.element.tagName
        }),
        action: event.detail.action
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
  ], EditingElement.prototype, "doc", 2);
  return EditingElement;
}
