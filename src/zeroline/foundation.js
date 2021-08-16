import {css} from "../../_snowpack/pkg/lit-element.js";
import {
  newActionEvent,
  isPublic
} from "../foundation.js";
function containsReference(element, iedName) {
  return Array.from(element.getElementsByTagName("LNode")).filter(isPublic).some((lnode) => lnode.getAttribute("iedName") === iedName);
}
function isReferencedItself(element, iedName) {
  return Array.from(element.children).some((child) => child.tagName === "LNode" && child.getAttribute("iedName") === iedName);
}
function hasReferencedChildren(element, iedName) {
  const threshold = element.tagName === "Bay" ? 0 : 1;
  return Array.from(element.children).filter((child) => containsReference(child, iedName)).length > threshold;
}
function hasOurs(element, iedName) {
  return Array.from(element.getElementsByTagName("LNode")).filter(isPublic).some((lnode) => lnode.getAttribute("iedName") === iedName);
}
function getOurs(element, iedName) {
  return Array.from(element.getElementsByTagName("LNode")).filter(isPublic).filter((lnode) => lnode.getAttribute("iedName") === iedName);
}
function hasTheirs(element, iedName) {
  const ours = getOurs(element, iedName);
  const scl = element.closest("SCL");
  return Array.from(scl.getElementsByTagName("LNode")).filter(isPublic).filter((lnode) => lnode.getAttribute("iedName") === iedName).some((lnode) => !ours.includes(lnode));
}
export function attachedIeds(element, remainingIeds) {
  const attachedIeds2 = [];
  for (const ied of remainingIeds) {
    const iedName = ied.getAttribute("name");
    if (element.tagName === "SCL") {
      if (!hasOurs(element, iedName) || hasReferencedChildren(element, iedName))
        attachedIeds2.push(ied);
      continue;
    }
    if (hasTheirs(element, iedName))
      continue;
    if (hasReferencedChildren(element, iedName) || isReferencedItself(element, iedName))
      attachedIeds2.push(ied);
  }
  for (const ied of attachedIeds2) {
    remainingIeds.delete(ied);
  }
  return attachedIeds2;
}
export function getAttachedIeds(doc) {
  return (element) => {
    const ieds = new Set(Array.from(doc.querySelectorAll("IED")).filter(isPublic));
    return attachedIeds(element, ieds);
  };
}
export function cloneSubstationElement(editor) {
  const element = editor.element;
  const parent = element.parentElement;
  const num = parent.querySelectorAll(`${element.tagName}[name^="${element.getAttribute("name") ?? ""}"]`).length;
  const clone = element.cloneNode(true);
  clone.querySelectorAll("LNode").forEach((lNode) => lNode.parentElement?.removeChild(lNode));
  clone.querySelectorAll('Terminal:not([cNodeName="grounded"])').forEach((terminal) => terminal.parentElement?.removeChild(terminal));
  clone.querySelectorAll("ConnectivityNode").forEach((condNode) => condNode.parentElement?.removeChild(condNode));
  clone.setAttribute("name", element.getAttribute("name") + num);
  editor.dispatchEvent(newActionEvent({
    new: {
      parent,
      element: clone,
      reference: element.nextSibling
    }
  }));
}
export function startMove(editor, Child, Parent) {
  if (!editor.element)
    return;
  editor.classList.add("moving");
  const moveToTarget = (e) => {
    if (e instanceof KeyboardEvent && e.key !== "Escape" && e.key !== " " && e.key !== "Enter")
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    editor.classList.remove("moving");
    window.removeEventListener("keydown", moveToTarget, true);
    window.removeEventListener("click", moveToTarget, true);
    if (e instanceof KeyboardEvent && e.key === "Escape")
      return;
    const targetEditor = e.composedPath().find((e2) => e2 instanceof Child || e2 instanceof Parent);
    if (targetEditor === void 0 || targetEditor === editor)
      return;
    const destination = targetEditor instanceof Child ? {
      parent: targetEditor.element.parentElement,
      reference: targetEditor.element
    } : {parent: targetEditor.element, reference: null};
    if (!destination.parent)
      return;
    if (editor.element.parentElement !== destination.parent || editor.element.nextElementSibling !== destination.reference)
      editor.dispatchEvent(newActionEvent({
        old: {
          element: editor.element,
          parent: editor.element.parentElement,
          reference: editor.element.nextSibling
        },
        new: destination
      }));
  };
  window.addEventListener("click", moveToTarget, true);
  window.addEventListener("keydown", moveToTarget, true);
}
const substationPath = [
  ":root",
  "Substation",
  "VoltageLevel",
  "Bay",
  "ConductingEquipment"
];
export const selectors = Object.fromEntries(substationPath.map((e, i, a) => [e, a.slice(0, i + 1).join(" > ")]));
export const styles = css`
  :host(.moving) section {
    opacity: 0.3;
  }

  section {
    background-color: var(--mdc-theme-surface);
    transition: all 200ms linear;
    outline-color: var(--mdc-theme-primary);
    outline-style: solid;
    outline-width: 0px;
    margin: 8px 12px 16px;
    opacity: 1;
  }

  section:focus {
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
  }

  section:focus-within {
    outline-width: 2px;
    transition: all 250ms linear;
  }

  h1,
  h2,
  h3 {
    color: var(--mdc-theme-on-surface);
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 0px;
    line-height: 48px;
    padding-left: 0.3em;
    transition: background-color 150ms linear;
  }

  section:focus-within > h1,
  section:focus-within > h2,
  section:focus-within > h3 {
    color: var(--mdc-theme-surface);
    background-color: var(--mdc-theme-primary);
    transition: background-color 200ms linear;
  }

  h1 > nav,
  h2 > nav,
  h3 > nav,
  h1 > abbr > mwc-icon-button,
  h2 > abbr > mwc-icon-button,
  h3 > abbr > mwc-icon-button {
    float: right;
  }

  abbr {
    text-decoration: none;
    border-bottom: none;
  }

  #iedcontainer {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }
`;
