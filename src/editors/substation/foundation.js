import {css} from "../../../web_modules/lit-element.js";
import {newActionEvent} from "../../foundation.js";
export function startMove(editor, Child, Parent) {
  if (!editor.element)
    return;
  editor.container.classList.add("moving");
  const moveToTarget = (e) => {
    if (e instanceof KeyboardEvent && e.key !== "Escape" && e.key !== " " && e.key !== "Enter")
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    editor.container.classList.remove("moving");
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
          reference: editor.element.nextElementSibling
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
  main,
  section {
    background-color: var(--mdc-theme-surface);
    transition: all 200ms linear;
    outline-color: var(--mdc-theme-primary);
    outline-style: solid;
    outline-width: 0px;
    margin: 8px 12px 16px;
    opacity: 1;
  }

  main.moving,
  section.moving {
    opacity: 0.3;
  }

  main:focus,
  section:focus {
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
  }

  main:focus-within,
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

  main:focus-within > h1,
  section:focus-within > h2,
  section:focus-within > h3 {
    color: var(--mdc-theme-surface);
    background-color: var(--mdc-theme-primary);
    transition: background-color 200ms linear;
  }

  h1 > nav,
  h2 > nav,
  h3 > nav,
  h1 > mwc-icon-button,
  h2 > mwc-icon-button,
  h3 > mwc-icon-button {
    float: right;
  }
`;
