import { css, html } from '../../../../_snowpack/pkg/lit-element.js';
import { ifDefined } from '../../../../_snowpack/pkg/lit-html/directives/if-defined.js';
import { getReference, getValue, isPublic, } from '../../foundation.js';
export const allDataTypeSelector = 'LNodeType, DOType, DAType, EnumType';
export function isCreateOptions(options) {
    return options.parent !== undefined;
}
export function updateIDNamingAction(element) {
    return (inputs) => {
        const id = getValue(inputs.find(i => i.label === 'id'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        if (id === element.getAttribute('id') &&
            desc === element.getAttribute('desc'))
            return [];
        const newElement = element.cloneNode(false);
        newElement.setAttribute('id', id);
        if (desc === null)
            newElement.removeAttribute('desc');
        else
            newElement.setAttribute('desc', desc);
        return [{ old: { element }, new: { element: newElement } }];
    };
}
export function addReferencedDataTypes(element, parent) {
    const templates = element.closest('DataTypeTemplates');
    const ids = Array.from(parent.querySelectorAll(allDataTypeSelector))
        .filter(isPublic)
        .map(type => type.getAttribute('id'));
    const types = Array.from(element.children)
        .map(child => child.getAttribute('type'))
        .filter(type => type)
        .filter(type => !ids.includes(type));
    const adjacents = types
        .map(type => templates.querySelector(`LNodeType[id="${type}"],DOType[id="${type}"],DAType[id="${type}"],EnumType[id="${type}"]`))
        .filter(isPublic);
    const actions = [];
    adjacents
        .flatMap(adjacent => addReferencedDataTypes(adjacent, parent))
        .forEach(action => actions.push(action));
    adjacents.forEach(adjacent => actions.push({
        new: {
            parent,
            element: adjacent,
            reference: getReference(parent, adjacent.tagName),
        },
    }));
    return actions;
}
export function buildListFromStringArray(list, selected) {
    return list.map(item => html `<mwc-list-item
      value=${ifDefined(item === null ? undefined : item)}
      ?selected=${item === selected}
      >${item}</mwc-list-item
    >`);
}
export const predefinedBasicTypeEnum = [
    'BOOLEAN',
    'INT8',
    'INT16',
    'INT24',
    'INT32',
    'INT64',
    'INT128',
    'INT8U',
    'INT16U',
    'INT24U',
    'INT32U',
    'FLOAT32',
    'FLOAT64',
    'Enum',
    'Dbpos',
    'Tcmd',
    'Quality',
    'Timestamp',
    'VisString32',
    'VisString64',
    'VisString65',
    'VisString129',
    'VisString255',
    'Octet64',
    'Unicode255',
    'Struct',
    'EntryTime',
    'Check',
    'ObjRef',
    'Currency',
    'PhyComAddr',
    'TrgOps',
    'OptFlds',
    'SvOptFlds',
    'EntryID',
];
export const valKindEnum = [null, 'Spec', 'Conf', 'RO', 'Set'];
/** Common `CSS` styles used by DataTypeTemplate subeditors */
export const styles = css `
  :host(.moving) section {
    opacity: 0.3;
  }

  section {
    background-color: var(--mdc-theme-surface);
    transition: all 200ms linear;
    outline-color: var(--mdc-theme-primary);
    outline-style: solid;
    outline-width: 0px;
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

  abbr[title] {
    border-bottom: none !important;
    cursor: inherit !important;
    text-decoration: none !important;
  }
`;
//# sourceMappingURL=foundation.js.map