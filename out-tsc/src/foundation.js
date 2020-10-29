import { directive } from '../../web_modules/lit-html.js';
import { WizardTextField } from './wizard-textfield.js';
// typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
export function isCreate(action) {
    return (action.old === undefined &&
        action.new?.parent !== undefined &&
        action.new?.element !== undefined &&
        action.new?.reference !== undefined);
}
export function isDelete(action) {
    return (action.old?.parent !== undefined &&
        action.old?.element !== undefined &&
        action.old?.reference !== undefined &&
        action.new === undefined);
}
export function isMove(action) {
    return (action.old?.parent !== undefined &&
        action.old?.element !== undefined &&
        action.old?.reference !== undefined &&
        action.new?.parent !== undefined &&
        action.new?.element == undefined &&
        action.new?.reference !== undefined);
}
export function isUpdate(action) {
    return (action.old?.parent === undefined &&
        action.old?.element !== undefined &&
        action.new?.parent === undefined &&
        action.new?.element !== undefined);
}
/** Returns the inverse of `action`, i.e. an `EditorAction` with opposite effect. */
export function invert(action) {
    if (isCreate(action))
        return { old: action.new, derived: action.derived };
    else if (isDelete(action))
        return { new: action.old, derived: action.derived };
    else if (isMove(action))
        return {
            old: {
                parent: action.new.parent,
                element: action.old.element,
                reference: action.new.reference,
            },
            new: { parent: action.old.parent, reference: action.old.reference },
        };
    else if (isUpdate(action))
        return { new: action.old, old: action.new, derived: action.derived };
    else
        return unreachable('Unknown EditorAction type in invert.');
}
export function newActionEvent(action, eventInitDict) {
    return new CustomEvent('editor-action', {
        bubbles: true,
        composed: true,
        detail: { action },
        ...eventInitDict,
    });
}
export const wizardInputSelector = 'wizard-textfield, mwc-select';
export function getValue(input) {
    if (input instanceof WizardTextField)
        return input.maybeValue;
    else
        return input.value;
}
export function getMultiplier(input) {
    if (input instanceof WizardTextField)
        return input.multiplier;
    else
        return null;
}
export function newWizardEvent(wizard = null, eventInitDict) {
    return new CustomEvent('wizard', {
        bubbles: true,
        composed: true,
        detail: { wizard },
        ...eventInitDict,
    });
}
export function newLogEvent(detail, eventInitDict) {
    return new CustomEvent('log', {
        bubbles: true,
        composed: true,
        detail: detail,
        ...eventInitDict,
    });
}
export function newPendingStateEvent(promise, eventInitDict) {
    return new CustomEvent('pending-state', {
        bubbles: true,
        composed: true,
        detail: { promise },
        ...eventInitDict,
    });
}
/** Useful `lit-html` directives */
export const ifImplemented = directive(rendered => (part) => {
    if (Object.keys(rendered).length)
        part.setValue(rendered);
    else
        part.setValue('');
});
/** Throws an error bearing `message`, never returning. */
export function unreachable(message) {
    throw new Error(message);
}
//# sourceMappingURL=foundation.js.map