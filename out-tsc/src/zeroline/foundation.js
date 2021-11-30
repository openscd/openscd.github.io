import { css } from '../../../_snowpack/pkg/lit-element.js';
import { newActionEvent, isPublic } from '../foundation.js';
import { circuitBreakerIcon, disconnectorIcon, currentTransformerIcon, voltageTransformerIcon, earthSwitchIcon, generalConductingEquipmentIcon, } from '../icons.js';
function containsReference(element, iedName) {
    return Array.from(element.getElementsByTagName('LNode'))
        .filter(isPublic)
        .some(lnode => lnode.getAttribute('iedName') === iedName);
}
function isReferencedItself(element, iedName) {
    return Array.from(element.children).some(child => child.tagName === 'LNode' && child.getAttribute('iedName') === iedName);
}
function hasReferencedChildren(element, iedName) {
    const threshold = element.tagName === 'Bay' ? 0 : 1;
    return (Array.from(element.children).filter(child => containsReference(child, iedName)).length > threshold);
}
function hasOurs(element, iedName) {
    return Array.from(element.getElementsByTagName('LNode'))
        .filter(isPublic)
        .some(lnode => lnode.getAttribute('iedName') === iedName);
}
function getOurs(element, iedName) {
    return Array.from(element.getElementsByTagName('LNode'))
        .filter(isPublic)
        .filter(lnode => lnode.getAttribute('iedName') === iedName);
}
function hasTheirs(element, iedName) {
    const ours = getOurs(element, iedName);
    const scl = element.closest('SCL');
    return Array.from(scl.getElementsByTagName('LNode'))
        .filter(isPublic)
        .filter(lnode => lnode.getAttribute('iedName') === iedName)
        .some(lnode => !ours.includes(lnode));
}
export function attachedIeds(element, remainingIeds) {
    const attachedIeds = [];
    for (const ied of remainingIeds) {
        const iedName = ied.getAttribute('name');
        if (element.tagName === 'SCL') {
            if (!hasOurs(element, iedName) || hasReferencedChildren(element, iedName))
                attachedIeds.push(ied);
            continue;
        }
        if (hasTheirs(element, iedName))
            continue;
        if (hasReferencedChildren(element, iedName) ||
            isReferencedItself(element, iedName))
            attachedIeds.push(ied);
    }
    for (const ied of attachedIeds) {
        remainingIeds.delete(ied);
    }
    return attachedIeds;
}
export function getAttachedIeds(doc) {
    return (element) => {
        const ieds = new Set(Array.from(doc.querySelectorAll('IED')).filter(isPublic));
        return attachedIeds(element, ieds);
    };
}
export function cloneSubstationElement(editor) {
    const element = editor.element;
    const parent = element.parentElement;
    const num = parent.querySelectorAll(`${element.tagName}[name^="${element.getAttribute('name') ?? ''}"]`).length;
    const clone = element.cloneNode(true);
    clone
        .querySelectorAll('LNode')
        .forEach(lNode => lNode.parentElement?.removeChild(lNode));
    // lNode element must be unique within substation -> must be removed
    clone
        .querySelectorAll('Terminal:not([cNodeName="grounded"])')
        .forEach(terminal => terminal.parentElement?.removeChild(terminal));
    // FIXME(JakobVogelsang): for the moment removes terminal as well.
    // For later terminal keep might be the better choice
    clone
        .querySelectorAll('ConnectivityNode')
        .forEach(condNode => condNode.parentElement?.removeChild(condNode));
    // FIXME(JakobVogelsang): for the moment beeing connectivity node remove as well.
    // For later connectivity keep might be the better choice to preserve substation structure
    clone.setAttribute('name', element.getAttribute('name') + num);
    editor.dispatchEvent(newActionEvent({
        new: {
            parent: parent,
            element: clone,
            reference: element.nextSibling,
        },
    }));
}
/**
 * Moves the element edited by `editor` to the place before the next `Child`
 * editor selected or to the end of the next `Parent` editor selected by mouse
 * click or keyboard (space or enter key).
 *
 * The move action can be aborted by clicking on something other than a `Child`
 * or `Parent` editor or by hitting the escape key on the keyboard.
 */
export function startMove(editor, Child, Parent) {
    if (!editor.element)
        return;
    editor.classList.add('moving');
    const moveToTarget = (e) => {
        if (e instanceof KeyboardEvent &&
            e.key !== 'Escape' &&
            e.key !== ' ' &&
            e.key !== 'Enter')
            return;
        e.preventDefault();
        e.stopImmediatePropagation();
        editor.classList.remove('moving');
        window.removeEventListener('keydown', moveToTarget, true);
        window.removeEventListener('click', moveToTarget, true);
        if (e instanceof KeyboardEvent && e.key === 'Escape')
            return;
        const targetEditor = e
            .composedPath()
            .find(e => e instanceof Child || e instanceof Parent);
        if (targetEditor === undefined || targetEditor === editor)
            return;
        const destination = targetEditor instanceof Child
            ? {
                parent: targetEditor.element.parentElement,
                reference: targetEditor.element,
            }
            : { parent: targetEditor.element, reference: null };
        if (!destination.parent)
            return;
        if (editor.element.parentElement !== destination.parent ||
            editor.element.nextElementSibling !== destination.reference)
            editor.dispatchEvent(newActionEvent({
                old: {
                    element: editor.element,
                    parent: editor.element.parentElement,
                    reference: editor.element.nextSibling,
                },
                new: destination,
            }));
    };
    window.addEventListener('click', moveToTarget, true);
    window.addEventListener('keydown', moveToTarget, true);
}
/**
 * Get the correct icon for a specific Conducting Equipment.
 * @param condEq - The Conducting Equipment to search the icon for.
 * @returns The icon.
 */
export function getIcon(condEq) {
    return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}
function typeStr(condEq) {
    if (condEq.getAttribute('type') === 'DIS' &&
        condEq.querySelector('Terminal')?.getAttribute('cNodeName') === 'grounded') {
        return 'ERS';
    }
    else {
        return condEq.getAttribute('type') ?? '';
    }
}
const typeIcons = {
    CBR: circuitBreakerIcon,
    DIS: disconnectorIcon,
    CTR: currentTransformerIcon,
    VTR: voltageTransformerIcon,
    ERS: earthSwitchIcon,
};
// Substation element hierarchy
const substationPath = [
    ':root',
    'Substation',
    'VoltageLevel',
    'Bay',
    'ConductingEquipment',
];
/** `Private`-safeguarded selectors for `Substation` and its descendants */
export const selectors = (Object.fromEntries(substationPath.map((e, i, a) => [e, a.slice(0, i + 1).join(' > ')])));
/** Common `CSS` styles used by substation subeditors */
export const styles = css `
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
//# sourceMappingURL=foundation.js.map