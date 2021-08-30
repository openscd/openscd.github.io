import { html, render } from '../../../_snowpack/pkg/lit-html.js';
import { get, translate } from '../../../_snowpack/pkg/lit-translate.js';
import { createElement, getChildElementsByTagName, getReference, identity, isPublic, referencePath, selector, } from '../foundation.js';
import { ListBase } from '../../../_snowpack/pkg/@material/mwc-list/mwc-list-base.js';
/** Logical nodes perferred for lnode reference to substation element */
const preferredLn = {
    CBR: ['CSWI', 'CILO', 'XCBR'],
    DIS: ['CSWI', 'CILO', 'XSWI'],
    VTR: ['TVTR'],
    CTR: ['TCTR'],
    Bay: ['LLN0'],
    VoltageLevel: ['LLN0'],
    Substation: ['LLN0'],
};
/** Sorts selected `ListItem`s to the top and disabled ones to the bottom. */
function compare(a, b) {
    if (a.disabled !== b.disabled)
        return b.disabled ? -1 : 1;
    if (a.preferred !== b.preferred)
        return a.preferred ? -1 : 1;
    if (a.selected !== b.selected)
        return a.selected ? -1 : 1;
    return 0;
}
const APldInst = 'Client LN';
/** Queries `parent` for an `LNode` described by logical node element. */
export function getLNode(parent, anyln) {
    return (Array.from(parent.getElementsByTagName('LNode'))
        .filter(item => !item.closest('Private'))
        .filter(lnode => isLNodeReference(anyln, lnode))[0] ?? null);
}
function isLNodeReference(anyln, lnode) {
    return ((lnode.getAttribute('iedName') ?? '') ===
        (anyln.closest('IED')?.getAttribute('name') ?? '') &&
        (lnode.getAttribute('ldInst') ?? '') ===
            (anyln.closest('LDevice')?.getAttribute('inst') ?? '') &&
        (lnode.getAttribute('prefix') ?? '') ===
            (anyln.getAttribute('prefix') ?? '') &&
        (lnode.getAttribute('lnClass') ?? '') ===
            (anyln.getAttribute('lnClass') ?? '') &&
        (lnode.getAttribute('lnInst') ?? '') === (anyln.getAttribute('inst') ?? ''));
}
function createAction(parent, anyln) {
    const element = createElement(parent.ownerDocument, 'LNode', {
        iedName: anyln.closest('IED')?.getAttribute('name') ?? '',
        ldInst: anyln.closest('LDevice')?.getAttribute('inst') ?? '',
        prefix: anyln.getAttribute('prefix') ?? '',
        lnClass: anyln.getAttribute('lnClass') ?? '',
        lnInst: anyln.getAttribute('inst') ?? '',
    });
    return {
        new: {
            parent,
            element,
            reference: getReference(parent, 'LNode'),
        },
    };
}
function deleteAction(parent, lnode) {
    return {
        old: {
            parent: parent,
            element: lnode,
            reference: lnode.nextElementSibling,
        },
    };
}
function includesAnyLN(anylns, lnode) {
    return anylns.some(anyln => isLNodeReference(anyln, lnode));
}
function includesLNode(anyln, lnodes) {
    return lnodes.some(lnode => isLNodeReference(anyln, lnode));
}
/**
 * @returns a `WizardAction` updating `parent`'s `LNodes`
 * to the entries selected in `wizard`'s `#lnList`.
 */
export function lNodeWizardAction(parent) {
    return (inputs, wizard, list) => {
        const selectedAnyLn = list.items
            .filter(item => item.selected)
            .map(item => item.value)
            .map(identity => {
            return parent.ownerDocument.querySelector(selector('LN0', identity))
                ? parent.ownerDocument.querySelector(selector('LN0', identity))
                : parent.ownerDocument.querySelector(selector('LN', identity));
        })
            .filter(item => item !== null);
        const oldLNodes = getChildElementsByTagName(parent, 'LNode').filter(isPublic);
        const deleteActions = oldLNodes
            .filter(lnode => !includesAnyLN(selectedAnyLn, lnode))
            .map(lnode => deleteAction(parent, lnode));
        const createActions = selectedAnyLn
            .filter(anyln => !includesLNode(anyln, oldLNodes))
            .map(anyln => createAction(parent, anyln));
        return deleteActions.concat(createActions);
    };
}
function getListContainer(target, selector) {
    return (target.parentElement?.parentElement?.nextElementSibling?.querySelector(selector) ?? null);
}
function onIEDSelect(evt, parent) {
    if (!(evt.target instanceof ListBase))
        return;
    const lnList = getListContainer(evt.target, '#lnList');
    if (lnList === null)
        return;
    const doc = parent.ownerDocument;
    const selectedIEDItems = evt.target.selected;
    const lnItems = selectedIEDItems
        .flatMap(item => Array.from(doc.querySelectorAll(`:root > IED[name="${item.value}"] > AccessPoint > LN,` +
        `:root > IED[name="${item.value}"] > AccessPoint > Server > LDevice > LN,` +
        `:root > IED[name="${item.value}"] > AccessPoint > Server > LDevice > LN0`)).filter(item => !item.closest('Private')))
        .filter(item => item !== null)
        .map(item => {
        const isPrefered = preferredLn[parent.getAttribute('type')
            ? parent.getAttribute('type') ?? ''
            : parent.tagName ?? '']?.includes(item.getAttribute('lnClass') ?? '') ?? false;
        const lnode = getLNode(parent.ownerDocument, item);
        const selected = lnode?.parentElement === parent;
        return {
            selected,
            disabled: lnode !== null && !selected,
            prefered: isPrefered,
            element: item,
        };
    })
        .sort(compare);
    const lnTemplates = lnItems.map(item => {
        return html `<mwc-check-list-item
      ?selected=${item.selected}
      ?disabled=${item.disabled}
      value="${identity(item.element)}"
      twoline
      ><span
        >${item.element.getAttribute('prefix') ??
            ''}${item.element.getAttribute('lnClass')}${item.element.getAttribute('inst') ?? ''}
        ${item.disabled
            ? html ` <mwc-icon style="--mdc-icon-size: 1em;"
                >account_tree</mwc-icon
              >
              ${referencePath(getLNode(doc, item.element))}`
            : ''}</span
      ><span slot="secondary"
        >${item.element.closest('IED')?.getAttribute('name') ?? ''} |
        ${item.element.closest('LDevice')
            ? item.element.closest('LDevice')?.getAttribute('inst')
            : APldInst}</span
      ></mwc-check-list-item
    >`;
    });
    render(html `${lnTemplates}`, lnList);
}
function renderIEDPage(element) {
    const doc = element.ownerDocument;
    if (doc.querySelectorAll(':root > IED').length > 0)
        return html `<filtered-list
      disableCheckAll
      multi
      id="iedList"
      @selected=${(evt) => onIEDSelect(evt, element)}
      >${Array.from(doc.querySelectorAll(':root > IED'))
            .map(ied => ied.getAttribute('name'))
            .map(iedName => {
            return {
                selected: Array.from(element.children)
                    .filter(item => !item.closest('Private'))
                    .filter(item => item.tagName === 'LNode' &&
                    item.getAttribute('iedName') === iedName).length > 0,
                iedName: iedName,
            };
        })
            .sort(compare)
            .map(item => html `<mwc-check-list-item
              value="${item.iedName ?? ''}"
              ?selected=${item.selected}
              >${item.iedName}</mwc-check-list-item
            >`)}</filtered-list
    >`;
    else
        return html `<mwc-list-item noninteractive graphic="icon">
      <span>${translate('lnode.wizard.placeholder')}</span>
      <mwc-icon slot="graphic">info</mwc-icon>
    </mwc-list-item>`;
}
/** @returns a Wizard for editing `element`'s `LNode` children. */
export function lNodeWizard(element) {
    return [
        {
            title: get('lnode.wizard.title.selectIEDs'),
            element,
            content: [renderIEDPage(element)],
        },
        {
            initial: Array.from(element.children).some(child => child.tagName === 'LNode'),
            title: get('lnode.wizard.title.selectLNs'),
            element,
            primary: {
                icon: 'save',
                label: get('save'),
                action: lNodeWizardAction(element),
            },
            content: [html `<filtered-list multi id="lnList"></filtered-list>`],
        },
    ];
}
//# sourceMappingURL=lnode.js.map