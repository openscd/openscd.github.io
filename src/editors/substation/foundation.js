import {css} from "../../../_snowpack/pkg/lit-element.js";
import "./function-editor.js";
import {newActionEvent, isPublic} from "../../foundation.js";
import {
  circuitBreakerIcon,
  disconnectorIcon,
  currentTransformerIcon,
  voltageTransformerIcon,
  earthSwitchIcon,
  generalConductingEquipmentIcon
} from "../../icons/icons.js";
import {typeStr} from "../../wizards/conductingequipment.js";
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
export function startMove(editor, childClass, parentClasses) {
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
    const targetEditor = e.composedPath().find((et) => et instanceof childClass || checkInstanceOfParentClass(et, parentClasses));
    if (targetEditor === void 0 || targetEditor === editor)
      return;
    const destination = targetEditor instanceof childClass ? {
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
function checkInstanceOfParentClass(et, classes) {
  const targetEditor = classes.find((clazz) => et instanceof clazz);
  return targetEditor !== void 0;
}
export function getIcon(condEq) {
  return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}
const typeIcons = {
  CBR: circuitBreakerIcon,
  DIS: disconnectorIcon,
  CTR: currentTransformerIcon,
  VTR: voltageTransformerIcon,
  ERS: earthSwitchIcon
};
const substationPath = [
  ":root",
  "Substation",
  "VoltageLevel",
  "Bay",
  "ConductingEquipment"
];
export const selectors = Object.fromEntries(substationPath.map((e, i, a) => [e, a.slice(0, i + 1).join(" > ")]));
export const styles = css`
  abbr {
    text-decoration: none;
    border-bottom: none;
  }

  .ptrContent.actionicon {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }

  #iedcontainer {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }

  .container.lnode {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }

  .container.subequipment {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }

  powertransformer-editor[showfunctions] {
    margin: 4px 8px 16px;
  }
`;
