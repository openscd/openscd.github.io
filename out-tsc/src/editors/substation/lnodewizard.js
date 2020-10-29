import { html, render } from '../../../../web_modules/lit-html.js';
import { get, translate } from '../../../../web_modules/lit-translate.js';
import '../../../../web_modules/@material/mwc-list/mwc-check-list-item.js';
import '../../../../web_modules/@material/mwc-list/mwc-list-item.js';
import '../../../../web_modules/@material/mwc-textfield.js';
function existLNode(value, parent) {
    return parent.querySelector(`${parent.tagName} > LNode[iedName="${value.iedName}"][ldInst="${value.ldInst}"]${value.prefix ? `[prefix="${value.prefix}"]` : ``}[lnClass="${value.lnClass}"]${value.inst === '' ? `` : `[lnInst="${value.inst}"]`}`)
        ? true
        : false;
}
function creteAction(value, parent) {
    return {
        new: {
            parent,
            element: new DOMParser().parseFromString(`<LNode iedName="${value.iedName}" ldInst="${value.ldInst}" ${value.prefix ? `prefix="${value.prefix}"` : ''} lnClass="${value.lnClass}" lnInst="${value.inst}"></LNode>`, 'application/xml').documentElement,
            reference: null,
        },
    };
}
function deleteAction(value, parent) {
    const element = parent.querySelector(`${parent.tagName} > LNode[iedName="${value.iedName}"][ldInst="${value.ldInst}"]${value.prefix ? `[prefix="${value.prefix}"]` : ``}[lnClass="${value.lnClass}"]${value.inst === '' ? `` : `[lnInst="${value.inst}"]`}`);
    return {
        old: {
            parent: parent,
            element: element,
            reference: element.nextElementSibling ?? null,
        },
    };
}
function lNodeActions(parent) {
    return (inputs, wizard) => {
        const actions = [];
        (wizard.shadowRoot?.querySelector('#lnList').items).forEach(item => {
            const value = JSON.parse(item.value);
            if (item.selected && !existLNode(value, parent)) {
                actions.push(creteAction(value, parent));
            }
            if (!item.selected && existLNode(value, parent)) {
                actions.push(deleteAction(value, parent));
            }
        });
        wizard.close();
        return actions;
    };
}
function onIEDSelect(evt, element) {
    const doc = element.ownerDocument;
    const ldList = (evt.target).parentElement?.parentElement?.nextElementSibling?.querySelector('#ldList') ?? null;
    if (ldList === null)
        return;
    const itemGroups = evt.target.selected
        .map(item => doc.querySelector(`IED[name="${item.value}"]`))
        .map(ied => {
        const values = Array.from(ied.querySelectorAll('LDevice')).map(lDevice => {
            return {
                iedName: ied.getAttribute('name'),
                ldInst: lDevice.getAttribute('inst'),
            };
        });
        const deviceItems = values.map(value => html `<mwc-check-list-item
            value="${JSON.stringify(value)}"
            twoline
            ?selected="${element.querySelector(`${element.tagName} > LNode[ldInst="${value.ldInst}"]`)}"
            ><span>${value.ldInst}</span
            ><span slot="secondary">${value.iedName}</span></mwc-check-list-item
          >`);
        return html `${deviceItems}
        <li divider role="separator"></li>`;
    });
    render(html `${itemGroups}`, ldList);
}
function onLdSelect(evt, element) {
    const doc = element.ownerDocument;
    const lnList = (evt.target).parentElement?.parentElement?.nextElementSibling?.querySelector('#lnList') ?? null;
    if (lnList === null)
        return;
    const itemGroups = evt.target.selected
        .map((item) => JSON.parse(item.value))
        .map(ldValue => {
        const values = Array.from(doc.querySelectorAll(`IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN
          ,IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN0`)).map(ln => {
            return {
                prefix: ln.getAttribute('prefix'),
                lnClass: ln.getAttribute('lnClass') ?? '',
                inst: ln.getAttribute('inst') ?? '',
                ...ldValue,
            };
        });
        const nodeItems = values.map(value => {
            return html `<mwc-check-list-item
          ?selected=${existLNode(value, element)}
          value="${JSON.stringify(value)}"
          twoline
          ><span>${value.prefix}${value.lnClass}${value.inst}</span
          ><span slot="secondary"
            >${value.iedName} | ${value.ldInst}</span
          ></mwc-check-list-item
        >`;
        });
        return html `${nodeItems}
        <li divider role="separator"></li>`;
    });
    render(html `${itemGroups}`, lnList);
}
function filter(item, searchfield) {
    return item.value.toUpperCase().includes(searchfield.value.toUpperCase());
}
function onFilter(evt, selector) {
    (evt.target.parentElement?.querySelector(selector)).items.forEach(item => {
        filter(item, evt.target)
            ? item.removeAttribute('style')
            : item.setAttribute('style', 'display:none;');
    });
}
function renderIEDPage(element) {
    const doc = element.ownerDocument;
    return html `<wizard-textfield
      label="${translate('filter')}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, '#iedList')}"
    ></wizard-textfield>
    <mwc-list
      activatable
      multi
      id="iedList"
      @selected="${(evt) => onIEDSelect(evt, element)}"
      >${Array.from(doc.querySelectorAll('IED'))
        .map(ied => ied.getAttribute('name'))
        .map(iedName => html `<mwc-check-list-item
              .value=${iedName ?? ''}
              ?selected="${element.querySelector(`${element.tagName} > LNode[iedName="${iedName}"]`)}"
              >${iedName}</mwc-check-list-item
            >`)}</mwc-list
    >`;
}
function renderLdPage(element) {
    return html `<wizard-textfield
      label="${translate('filter')}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, '#ldList')}"
    ></wizard-textfield>
    <mwc-list
      activatable
      multi
      id="ldList"
      @selected="${(evt) => onLdSelect(evt, element)}"
    ></mwc-list>`;
}
function renderLnPage() {
    return html `<wizard-textfield
      label="${translate('filter')}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, '#lnList')}"
    ></wizard-textfield>
    <mwc-list activatable multi id="lnList"></mwc-list>`;
}
export function editlNode(element) {
    return [
        {
            title: get('lnode.wizard.title.selectIEDs'),
            content: [renderIEDPage(element)],
        },
        {
            title: get('lnode.wizard.title.selectLDs'),
            content: [renderLdPage(element)],
        },
        {
            title: get('lnode.wizard.title.selectLNs'),
            primary: {
                icon: 'add',
                label: get('add'),
                action: lNodeActions(element),
            },
            content: [renderLnPage()],
        },
    ];
}
//# sourceMappingURL=lnodewizard.js.map