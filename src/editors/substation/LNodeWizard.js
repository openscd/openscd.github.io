import "../../../web_modules/@material/mwc-list/mwc-check-list-item.js";
import "../../../web_modules/@material/mwc-list/mwc-list-item.js";
import "../../../web_modules/@material/mwc-textfield.js";
import {html, render} from "../../../web_modules/lit-html.js";
import {get, translate} from "../../../web_modules/lit-translate.js";
function createAction(parent) {
  return (inputs, wizard) => {
    const actions = [];
    (wizard.shadowRoot?.querySelector("#lnList")).selected.map((item) => {
      const value = JSON.parse(item.value);
      const action = {
        new: {
          parent,
          element: new DOMParser().parseFromString(`<LNode iedName="${value.iedName}" ldInst="${value.ldInst}" ${value.prefix ? `prefix="${value.prefix}"` : ""} lnClass="${value.lnClass}" lnInst="${value.inst}"></LNode>`, "application/xml").documentElement,
          reference: null
        }
      };
      actions.push(action);
    });
    wizard.close();
    return actions;
  };
}
function removeAction(parent) {
  return (inputs, wizard) => {
    const actions = [];
    Array.from((wizard.shadowRoot?.querySelector("#lNodeList")).index).map((index) => {
      const element = Array.from(parent.children).filter((child) => child.tagName === "LNode")[index];
      const action = {
        old: {
          parent,
          element,
          reference: element.nextElementSibling ?? null
        }
      };
      actions.push(action);
    });
    wizard.close();
    return actions;
  };
}
function onIEDSelect(evt, doc) {
  const ldList = evt.target.parentElement?.parentElement?.nextElementSibling?.querySelector("#ldList") ?? null;
  if (ldList === null)
    return;
  const itemGroups = evt.target.selected.map((item) => doc.querySelector(`IED[name="${item.value}"]`)).map((ied) => {
    const values = Array.from(ied.querySelectorAll("LDevice")).map((lDevice) => {
      return {
        iedName: ied.getAttribute("name"),
        ldInst: lDevice.getAttribute("inst")
      };
    });
    const deviceItems = values.map((value) => html`<mwc-check-list-item value="${JSON.stringify(value)}" twoline
            ><span>${value.ldInst}</span
            ><span slot="secondary">${value.iedName}</span></mwc-check-list-item
          >`);
    return html`${deviceItems}
        <li divider role="separator"></li>`;
  });
  render(html`${itemGroups}`, ldList);
}
function onLdSelect(evt, doc) {
  const lnList = evt.target.parentElement?.parentElement?.nextElementSibling?.querySelector("#lnList") ?? null;
  if (lnList === null)
    return;
  const itemGroups = evt.target.selected.map((item) => JSON.parse(item.value)).map((ldValue) => {
    const values = Array.from(doc.querySelectorAll(`IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN
          ,IED[name="${ldValue.iedName}"] LDevice[inst="${ldValue.ldInst}"] LN0`)).map((ln) => {
      return {
        prefix: ln.getAttribute("prefix"),
        lnClass: ln.getAttribute("lnClass"),
        inst: ln.getAttribute("inst"),
        ...ldValue
      };
    });
    const nodeItems = values.map((value) => html`<mwc-check-list-item value="${JSON.stringify(value)}" twoline
            ><span>${value.prefix}${value.lnClass}${value.inst}</span
            ><span slot="secondary"
              >${value.iedName} | ${value.ldInst}</span
            ></mwc-check-list-item
          >`);
    return html`${nodeItems}
        <li divider role="separator"></li>`;
  });
  render(html`${itemGroups}`, lnList);
}
function onIedFilter(evt) {
  (evt.target.parentElement?.querySelector("#iedList")).items.map((item) => {
    if (item.value.toUpperCase().includes(evt.target.value.toUpperCase())) {
      item.removeAttribute("disabled");
      item.removeAttribute("style");
    } else {
      item.setAttribute("disabled", "true");
      item.setAttribute("style", "display:none;");
    }
  });
}
function onLdFilter(evt) {
  (evt.target.parentElement?.querySelector("#ldList")).items.map((item) => {
    if (item.querySelector("span")?.innerText.toUpperCase().includes(evt.target.value.toUpperCase())) {
      item.removeAttribute("disabled");
      item.removeAttribute("style");
    } else {
      item.setAttribute("disabled", "true");
      item.setAttribute("style", "display:none;");
    }
  });
}
function onLnFilter(evt) {
  Array.from((evt.target.parentElement?.querySelector("#lnList")).children).forEach((item) => {
    if (item.querySelector("span")?.innerText.toUpperCase().includes(evt.target.value.toUpperCase())) {
      item.removeAttribute("style");
    } else {
      item.setAttribute("style", "display:none;");
    }
  });
}
function onLNodeFilter(evt) {
  (evt.target.parentElement?.querySelector("#lNodeList")).items.map((item) => {
    if (item.querySelector("span")?.innerText.toUpperCase().includes(evt.target.value.toUpperCase())) {
      item.removeAttribute("disabled");
      item.removeAttribute("style");
    } else {
      item.setAttribute("disabled", "true");
      item.setAttribute("style", "display:none;");
    }
  });
}
export function add(element) {
  const doc = element.ownerDocument;
  return [
    {
      title: get("lnode.wizard.title.selectIEDs"),
      content: [
        html`<wizard-textfield
            label="${translate("filter")}"
            iconTrailing="search"
            @input="${onIedFilter}"
          ></wizard-textfield>
          <mwc-list
            activatable
            multi
            id="iedList"
            @selected="${(evt) => onIEDSelect(evt, doc)}"
            >${Array.from(doc.querySelectorAll("IED")).map((ied) => html`<mwc-check-list-item
                  .value=${ied.getAttribute("name") ?? ""}
                  >${ied.getAttribute("name")}</mwc-check-list-item
                >`)}</mwc-list
          >`
      ]
    },
    {
      title: get("lnode.wizard.title.selectLDs"),
      content: [
        html`<wizard-textfield
            label="${translate("filter")}"
            iconTrailing="search"
            @input="${onLdFilter}"
          ></wizard-textfield>
          <mwc-list
            activatable
            multi
            id="ldList"
            @selected="${(evt) => onLdSelect(evt, doc)}"
          ></mwc-list>`
      ]
    },
    {
      title: get("lnode.wizard.title.selectLNs"),
      primary: {
        icon: "add",
        label: get("add"),
        action: createAction(element)
      },
      content: [
        html`<wizard-textfield
            label="${translate("filter")}"
            iconTrailing="search"
            @input="${onLnFilter}"
          ></wizard-textfield>
          <mwc-list activatable multi id="lnList"></mwc-list>`
      ]
    }
  ];
}
export function remove(element) {
  return [
    {
      title: get("lnode.wizard.title.selectLNodes"),
      primary: {
        icon: "delete",
        label: get("remove"),
        action: removeAction(element)
      },
      content: [
        html`<wizard-textfield
            label="${translate("filter")}"
            iconTrailing="search"
            @input="${onLNodeFilter}"
          ></wizard-textfield>
          <mwc-list activatable multi id="lNodeList"
            >${Array.from(element.children).filter((child) => child.tagName === "LNode").map((lNode) => html`<mwc-check-list-item twoline
                    ><span
                      >${(lNode.getAttribute("prefix") ?? "") + (lNode.getAttribute("lnClass") ?? "") + (lNode.getAttribute("lnInst") ?? "")}</span
                    ><span slot="secondary"
                      >${lNode.getAttribute("iedName") + "|" + lNode.getAttribute("ldInst")}</span
                    ></mwc-check-list-item
                  >`)}</mwc-list
          >`
      ]
    }
  ];
}
