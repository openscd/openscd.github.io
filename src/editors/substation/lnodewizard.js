import {html, render} from "../../../web_modules/lit-html.js";
import {get, translate} from "../../../web_modules/lit-translate.js";
import {
  crossProduct,
  referencePath
} from "../../foundation.js";
import "../../../web_modules/@material/mwc-list/mwc-check-list-item.js";
import "../../../web_modules/@material/mwc-list/mwc-list-item.js";
import "../../../web_modules/@material/mwc-textfield.js";
import "../../../web_modules/@material/mwc-icon.js";
import {List} from "../../../web_modules/@material/mwc-list.js";
import {selectors} from "./foundation.js";
function compareDescription(a, b) {
  if (a.selected !== b.selected)
    return a.selected ? -1 : 1;
  if (a.disabled !== b.disabled)
    return b.disabled ? -1 : 1;
  return 0;
}
const APldInst = "Client LN";
export function getLNode(parent, value) {
  const parentTag = parent instanceof Element ? parent.tagName : void 0;
  const base = `LNode[iedName="${value.iedName}"][ldInst="${value.ldInst}"][lnClass="${value.lnClass}"]`;
  const ancestries = parentTag ? [selectors[parentTag]] : [
    "Substation",
    "VoltageLevel",
    "Bay",
    "ConductingEquipment"
  ].map((s) => selectors[s]);
  const prefix = value.prefix ? [`[prefix="${value.prefix}"]`] : [":not([prefix])", '[prefix=""]'];
  const lnInst = value.inst ? [`[lnInst="${value.inst}"]`] : [":not([lnInst])", '[lnInst=""]'];
  const selector = crossProduct(ancestries, [" > "], [base], prefix, lnInst).map((a) => a.join("")).join(",");
  return parent.querySelector(selector);
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
  const element = getLNode(parent, value);
  return {
    old: {
      parent,
      element,
      reference: element.nextElementSibling
    }
  };
}
export function lNodeWizardAction(parent) {
  return (inputs, wizard) => {
    const newLNodes = wizard.shadowRoot.querySelector("#lnList").items.filter((item) => item.selected).map((item) => item.value);
    const oldLNodes = Array.from(parent.querySelectorAll(`${selectors[parent.tagName]} > LNode`)).map((node) => {
      return {
        iedName: node.getAttribute("iedName") ?? "",
        ldInst: node.getAttribute("ldInst") === APldInst ? "" : node.getAttribute("ldInst") ?? "",
        prefix: node.getAttribute("prefix") ?? "",
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
function getListContainer(target, id) {
  return target.parentElement?.parentElement?.nextElementSibling?.querySelector(id) ?? null;
}
function onIEDSelect(evt, element) {
  if (!(evt.target instanceof List))
    return;
  const ldList = getListContainer(evt.target, "#ldList");
  if (ldList === null)
    return;
  const doc = element.ownerDocument;
  const selectedIEDItems = evt.target.selected;
  const selectedIEDs = selectedIEDItems.map((item) => doc.querySelector(`:root > IED[name="${item.value}"]`));
  const ldValues = selectedIEDs.flatMap((ied) => {
    const values = Array.from(ied.querySelectorAll(":root > IED > AccessPoint > Server > LDevice")).map((lDevice) => {
      return {
        iedName: ied.getAttribute("name"),
        ldInst: lDevice.getAttribute("inst") ?? ""
      };
    });
    if (ied.querySelectorAll(":root > IED > AccessPoint > LN").length) {
      values.push({
        iedName: ied.getAttribute("name"),
        ldInst: APldInst
      });
    }
    return values;
  });
  const ldDescriptions = ldValues.map((value) => {
    return {
      value,
      selected: element.querySelector(`${selectors[element.tagName]} > LNode[ldInst="${value.ldInst === APldInst ? "" : value.ldInst}"]`) !== null
    };
  }).sort(compareDescription);
  const ldItems = ldDescriptions.map((item) => html`<mwc-check-list-item
        value="${JSON.stringify(item.value)}"
        twoline
        ?selected="${item.selected}"
        ><span>${item.value.ldInst}</span
        ><span slot="secondary"
          >${item.value.iedName}</span
        ></mwc-check-list-item
      >`);
  render(html`${ldItems}`, ldList);
}
function onLDSelect(evt, element) {
  if (!(evt.target instanceof List))
    return;
  const lnList = getListContainer(evt.target, "#lnList");
  if (lnList === null)
    return;
  const doc = element.ownerDocument;
  const selectedLDItems = evt.target.selected;
  const ldValues = selectedLDItems.map((item) => JSON.parse(item.value));
  const lnValues = ldValues.flatMap((ldValue) => {
    const selector = ldValue.ldInst === APldInst ? `:root > IED[name="${ldValue.iedName}"] > AccessPoint > LN` : `:root > IED[name="${ldValue.iedName}"] > AccessPoint > Server > LDevice[inst="${ldValue.ldInst}"] > LN,:root > IED[name="${ldValue.iedName}"] > AccessPoint > Server > LDevice[inst="${ldValue.ldInst}"] > LN0`;
    const values = Array.from(doc.querySelectorAll(selector)).map((ln) => {
      return {
        ...ldValue,
        prefix: ln.getAttribute("prefix") ?? "",
        lnClass: ln.getAttribute("lnClass") ?? "",
        inst: ln.getAttribute("inst") ?? ""
      };
    });
    return values;
  });
  const lnDescriptions = lnValues.map((value) => {
    return {
      value,
      selected: getLNode(element, value) !== null,
      lNode: getLNode(element.ownerDocument, value)
    };
  }).map((item) => {
    return {
      ...item,
      disabled: !item.selected && item.lNode !== null
    };
  }).sort(compareDescription);
  const lnItems = lnDescriptions.map((item) => {
    return html`<mwc-check-list-item
      ?selected=${item.selected}
      ?disabled=${item.disabled}
      value="${JSON.stringify(item.value)}"
      twoline
      ><span
        >${item.value.prefix}${item.value.lnClass}${item.value.inst}
        ${item.disabled ? html` <mwc-icon style="--mdc-icon-size: 1em;"
                >account_tree</mwc-icon
              >
              ${referencePath(item.lNode)}` : ""}</span
      ><span slot="secondary"
        >${item.value.iedName} | ${item.value.ldInst}</span
      ></mwc-check-list-item
    >`;
  });
  render(html`${lnItems}`, lnList);
}
function onFilterInput(evt) {
  (evt.target.parentElement?.querySelector("mwc-list")).items.forEach((item) => {
    item.value.toUpperCase().includes(evt.target.value.toUpperCase()) ? item.removeAttribute("style") : item.setAttribute("style", "display:none;");
  });
}
function renderIEDPage(element) {
  const doc = element.ownerDocument;
  if (doc.querySelectorAll(":root > IED").length > 0)
    return html`<mwc-textfield
        label="${translate("filter")}"
        iconTrailing="search"
        @input=${onFilterInput}
      ></mwc-textfield>
      <mwc-list
        multi
        id="iedList"
        @selected="${(evt) => onIEDSelect(evt, element)}"
        >${Array.from(doc.querySelectorAll(":root > IED")).map((ied) => ied.getAttribute("name")).map((iedName) => {
      return {
        selected: element.querySelector(`${selectors[element.tagName]} > LNode[iedName="${iedName}"]`) !== null,
        value: iedName
      };
    }).sort(compareDescription).map((item) => html`<mwc-check-list-item
                value="${item.value ?? ""}"
                ?selected=${item.selected}
                >${item.value}</mwc-check-list-item
              >`)}</mwc-list
      >`;
  else
    return html`<mwc-list-item disabled graphic="icon">
      <span>${translate("lnode.wizard.placeholder")}</span>
      <mwc-icon slot="graphic">info</mwc-icon>
    </mwc-list-item>`;
}
function renderLdPage(element) {
  return html`<mwc-textfield
      label="${translate("filter")}"
      iconTrailing="search"
      @input=${onFilterInput}
    ></mwc-textfield>
    <mwc-list
      multi
      id="ldList"
      @selected="${(evt) => onLDSelect(evt, element)}"
    ></mwc-list>`;
}
function renderLnPage() {
  return html`<mwc-textfield
      label="${translate("filter")}"
      iconTrailing="search"
      @input=${onFilterInput}
    ></mwc-textfield>
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
        action: lNodeWizardAction(element)
      },
      content: [renderLnPage()]
    }
  ];
}
