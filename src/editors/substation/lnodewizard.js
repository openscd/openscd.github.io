import {html, render} from "../../../web_modules/lit-html.js";
import {get, translate} from "../../../web_modules/lit-translate.js";
import "../../../web_modules/@material/mwc-list/mwc-check-list-item.js";
import "../../../web_modules/@material/mwc-list/mwc-list-item.js";
import "../../../web_modules/@material/mwc-textfield.js";
function hasLNode(parent, value) {
  return parent.querySelector(`${parent.tagName} > LNode[iedName="${value.iedName}"][ldInst="${value.ldInst}"]${value.prefix ? `[prefix="${value.prefix}"]` : ``}${value.inst ? `[lnInst="${value.inst}"]` : ""}[lnClass="${value.lnClass}"]`) !== null;
}
function createAction(parent, value) {
  return {
    new: {
      parent,
      element: new DOMParser().parseFromString(`<LNode iedName="${value.iedName}" ldInst="${value.ldInst}" ${value.prefix ? `prefix="${value.prefix}"` : ""} lnClass="${value.lnClass}" lnInst="${value.inst}"></LNode>`, "application/xml").documentElement,
      reference: null
    }
  };
}
function deleteAction(parent, value) {
  const element = parent.querySelector(`${parent.tagName} > LNode[iedName="${value.iedName}"][ldInst="${value.ldInst}"]${value.prefix ? `[prefix="${value.prefix}"]` : ""}[lnClass="${value.lnClass}"]${value.inst ? `[lnInst="${value.inst}"]` : ""}`);
  return {
    old: {
      parent,
      element,
      reference: element.nextElementSibling ?? null
    }
  };
}
function lNodeActions(parent) {
  return (inputs, wizard) => {
    const newLNodes = wizard.shadowRoot.querySelector("#lnList").items.filter((item) => item.selected).map((item) => item.value);
    const oldLNodes = Array.from(parent.querySelectorAll(`${parent.tagName} > LNode`)).map((node) => {
      return {
        iedName: node.getAttribute("iedName") ?? "",
        ldInst: node.getAttribute("ldInst") ?? "",
        prefix: node.getAttribute("prefix"),
        lnClass: node.getAttribute("lnClass") ?? "",
        inst: node.getAttribute("lnInst") ?? ""
      };
    }).map((value) => JSON.stringify(value));
    const deleteActions = oldLNodes.filter((node) => !newLNodes.includes(node)).map((node) => deleteAction(parent, JSON.parse(node)));
    const createActions = newLNodes.filter((node) => !oldLNodes.includes(node)).map((node) => createAction(parent, JSON.parse(node)));
    wizard.close();
    return deleteActions.concat(createActions);
  };
}
function onIEDSelect(evt, element) {
  const doc = element.ownerDocument;
  const ldList = evt.target.parentElement?.parentElement?.nextElementSibling?.querySelector("#ldList") ?? null;
  if (ldList === null)
    return;
  const itemGroups = evt.target.selected.map((item) => doc.querySelector(`IED[name="${item.value}"]`)).map((ied) => {
    const values = Array.from(ied.querySelectorAll("LDevice")).map((lDevice) => {
      return {
        iedName: ied.getAttribute("name"),
        ldInst: lDevice.getAttribute("inst") ?? ""
      };
    });
    const deviceItems = values.map((value) => html`<mwc-check-list-item
            value="${JSON.stringify(value)}"
            twoline
            ?selected="${element.querySelector(`${element.tagName} > LNode[ldInst="${value.ldInst}"]`)}"
            ><span>${value.ldInst}</span
            ><span slot="secondary">${value.iedName}</span></mwc-check-list-item
          >`);
    return html`${deviceItems}
        <li divider role="separator"></li>`;
  });
  render(html`${itemGroups}`, ldList);
}
function onLdSelect(evt, element) {
  const doc = element.ownerDocument;
  const lnList = evt.target.parentElement?.parentElement?.nextElementSibling?.querySelector("#lnList") ?? null;
  if (lnList === null)
    return;
  const itemGroups = evt.target.selected.map((item) => JSON.parse(item.value)).map((ldValue) => {
    const values = Array.from(doc.querySelectorAll(`IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN
          ,IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN0`)).map((ln) => {
      return {
        ...ldValue,
        prefix: ln.getAttribute("prefix"),
        lnClass: ln.getAttribute("lnClass") ?? "",
        inst: ln.getAttribute("inst") ?? ""
      };
    });
    const nodeItems = values.map((value) => {
      return html`<mwc-check-list-item
          ?selected=${hasLNode(element, value)}
          value="${JSON.stringify(value)}"
          twoline
          ><span>${value.prefix}${value.lnClass}${value.inst}</span
          ><span slot="secondary"
            >${value.iedName} | ${value.ldInst}</span
          ></mwc-check-list-item
        >`;
    });
    return html`${nodeItems}
        <li divider role="separator"></li>`;
  });
  render(html`${itemGroups}`, lnList);
}
function filter(item, searchfield) {
  return item.value.toUpperCase().includes(searchfield.value.toUpperCase());
}
function onFilter(evt, selector) {
  (evt.target.parentElement?.querySelector(selector)).items.forEach((item) => {
    filter(item, evt.target) ? item.removeAttribute("style") : item.setAttribute("style", "display:none;");
  });
}
function renderIEDPage(element) {
  const doc = element.ownerDocument;
  return html`<wizard-textfield
      label="${translate("filter")}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, "#iedList")}"
    ></wizard-textfield>
    <mwc-list
      multi
      id="iedList"
      @selected="${(evt) => onIEDSelect(evt, element)}"
      >${Array.from(doc.querySelectorAll("IED")).map((ied) => ied.getAttribute("name")).map((iedName) => html`<mwc-check-list-item
              .value=${iedName ?? ""}
              ?selected="${element.querySelector(`${element.tagName} > LNode[iedName="${iedName}"]`)}"
              >${iedName}</mwc-check-list-item
            >`)}</mwc-list
    >`;
}
function renderLdPage(element) {
  return html`<wizard-textfield
      label="${translate("filter")}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, "#ldList")}"
    ></wizard-textfield>
    <mwc-list
      multi
      id="ldList"
      @selected="${(evt) => onLdSelect(evt, element)}"
    ></mwc-list>`;
}
function renderLnPage() {
  return html`<wizard-textfield
      label="${translate("filter")}"
      iconTrailing="search"
      @input="${(evt) => onFilter(evt, "#lnList")}"
    ></wizard-textfield>
    <mwc-list multi id="lnList"></mwc-list>`;
}
export function editlNode(element) {
  return [
    {
      title: get("lnode.wizard.title.selectIEDs"),
      content: [renderIEDPage(element)]
    },
    {
      title: get("lnode.wizard.title.selectLDs"),
      content: [renderLdPage(element)]
    },
    {
      title: get("lnode.wizard.title.selectLNs"),
      primary: {
        icon: "save",
        label: get("save"),
        action: lNodeActions(element)
      },
      content: [renderLnPage()]
    }
  ];
}
