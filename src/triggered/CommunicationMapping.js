import {html, LitElement} from "../../_snowpack/pkg/lit-element.js";
import {get} from "../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  findControlBlocks,
  identity,
  newWizardEvent,
  pathParts,
  selector
} from "../foundation.js";
import {clientIcon, controlBlockIcons, inputIcon} from "../icons.js";
function getPath(identity2) {
  if (typeof identity2 !== "string")
    return "";
  return pathParts(identity2)[0] ?? "";
}
function getElement(identity2) {
  if (typeof identity2 !== "string")
    return "";
  return pathParts(identity2)[1] ?? "";
}
function getLogicalNode(doc, identity2) {
  if (identity2.split(">").length === 4) {
    return doc.querySelector(selector("LN", identity2));
  }
  if (identity2.split(">").length === 3) {
    if (getElement(identity2).split(" ").length > 1) {
      return doc.querySelector(selector("LN", identity2));
    }
    if (getElement(identity2).split(" ").length === 1) {
      return doc.querySelector(selector("LN0", identity2));
    }
  }
  return null;
}
function hasClientLN(cb, identity2) {
  for (const clientLN of Array.from(cb.getElementsByTagName("ClientLN"))) {
    const [iedName, apRef, ldInst, prefix, lnClass, lnInst] = [
      "iedName",
      "apRef",
      "ldInst",
      "prefix",
      "lnClass",
      "lnInst"
    ].map((attribute) => clientLN.getAttribute(attribute));
    const ln = getLogicalNode(cb.ownerDocument, identity2);
    if (!ln)
      break;
    const ied = ln.closest("IED");
    const ap = ln.closest("AccessPoint");
    const ld = ln.closest("LDevice");
    if (identity2.split(">").length === 4) {
      if (iedName === ied?.getAttribute("name") && apRef === ap?.getAttribute("name") && ldInst === ld?.getAttribute("inst") && (prefix ?? "") === (ln.getAttribute("prefix") ?? "") && lnClass === ln.getAttribute("lnClass") && (lnInst ?? "") === (ln.getAttribute("inst") ?? ""))
        return true;
    }
    if (identity2.split(">").length === 3) {
      if (getElement(identity2).split(" ").length > 1) {
        const apCount = ied?.querySelectorAll("AccessPoint").length;
        if (iedName === ied?.getAttribute("name") && apCount && (apCount <= 1 || apRef === ap?.getAttribute("name")) && (prefix ?? "") === (ln.getAttribute("prefix") ?? "") && lnClass === ln.getAttribute("lnClass") && (lnInst ?? "") === (ln.getAttribute("inst") ?? ""))
          return true;
      }
      if (getElement(identity2).split(" ").length === 1) {
        if (iedName === ied?.getAttribute("name") && apRef === ap?.getAttribute("name") && ldInst === ld?.getAttribute("inst") && lnClass === ln.getAttribute("lnClass"))
          return true;
      }
    }
  }
  return false;
}
function addClientLNAction(doc) {
  return (inputs, wizard) => {
    const cbSelected = wizard.shadowRoot.querySelector("#sourcelist").selected;
    const selectedLNs = wizard.shadowRoot.querySelector("#sinklist").selected;
    const actions = [];
    selectedLNs.forEach((selectedLN) => {
      const lnIdentity = selectedLN.value;
      const reportCbs = cbSelected.map((cb) => cb.value).map((cbValue) => doc.querySelector(selector("ReportControl", cbValue))).filter((cb) => cb !== null);
      reportCbs.forEach((cb) => {
        if (cb.querySelector("RptEnabled") === null) {
          const rptEnabled = createElement(doc, "RptEnabled", {
            max: "1"
          });
          cb.appendChild(rptEnabled);
        }
        const ln = getLogicalNode(doc, lnIdentity);
        if (cb.querySelector("RptEnabled") !== null && !hasClientLN(cb, lnIdentity) && ln) {
          const element = createElement(doc, "ClientLN", {
            iedName: ln?.closest("IED")?.getAttribute("name") ?? null,
            apRef: ln?.closest("AccessPoint")?.getAttribute("name") ?? null,
            ldInst: ln?.closest("LDevice")?.getAttribute("inst") ?? "LD0",
            prefix: ln?.getAttribute("prefix") ?? "",
            lnClass: ln?.getAttribute("lnClass") ?? "",
            lnInst: ln?.getAttribute("inst") ?? ""
          });
          actions.push({
            new: {
              parent: cb.querySelector("RptEnabled"),
              element,
              reference: null
            }
          });
        }
      });
    });
    actions.push(() => communicationMappingWizard(doc));
    return actions;
  };
}
export function clientlnwizard(sourceIEDs, sinkIED) {
  return [
    {
      title: get("transform.comm-map.connectToIED", {
        iedName: sinkIED.getAttribute("name") ?? ""
      }),
      primary: {
        label: get("connect"),
        icon: "",
        action: addClientLNAction(sinkIED.ownerDocument)
      },
      secondary: {
        label: get("cancel"),
        icon: "",
        action: openCreateConnection(sinkIED.ownerDocument)
      },
      content: [
        html`<div
          class="wrapper"
          style="display: grid; grid-template-columns: 1fr 1fr;"
        >
          <filtered-list
            id="sourcelist"
            multi
            searchFieldLabel="${get("scl.Report")}"
            >${sourceIEDs.filter((sourceIED) => sourceIED.getAttribute("name") !== sinkIED.getAttribute("name")).flatMap((sourceIED) => {
          return Array.from(sourceIED.getElementsByTagName("ReportControl")).map((cb) => {
            return {
              identity: identity(cb),
              numberClientLNs: Array.from(cb.getElementsByTagName("ClientLN")).filter((clientLN) => clientLN.getAttribute("iedName") === sinkIED.getAttribute("name")).length
            };
          });
        }).sort((a, b) => b.numberClientLNs - a.numberClientLNs).map((item) => html`<mwc-check-list-item
                    left
                    hasMeta
                    twoline
                    value="${item.identity}"
                    ><span>${getElement(item.identity)}</span
                    ><span slot="secondary">${getPath(item.identity)}</span
                    ><span slot="meta"
                      >${item.numberClientLNs}</span
                    ></mwc-check-list-item
                  >`)}</filtered-list
          ><filtered-list
            multi
            id="sinklist"
            activatable
            searchFieldLabel="${get("scl.LN")}"
            >${Array.from(sinkIED.querySelectorAll(":root > IED > AccessPoint > LN")).map((ln) => html`<mwc-check-list-item twoline value="${identity(ln)}">
                  <span>${getElement(identity(ln))}</span>
                  <span slot="secondary">${getPath(identity(ln))}</span>
                </mwc-check-list-item>`)}
            <li divider role="separator"></li>
            ${Array.from(sinkIED.querySelectorAll(":root > IED > AccessPoint > Server > LDevice > LN")).map((ln) => html`<mwc-check-list-item twoline value="${identity(ln)}">
                  <span>${getElement(identity(ln))}</span>
                  <span slot="secondary">${getPath(identity(ln))}</span>
                </mwc-check-list-item>`)}
            ${Array.from(sinkIED.querySelectorAll(":root > IED > AccessPoint > Server > LDevice > LN0")).map((ln0) => html`<mwc-check-list-item twoline value="${identity(ln0)}">
                  <span>LLN0</span>
                  <span slot="secondary">${identity(ln0)}</span>
                </mwc-check-list-item>`)}</filtered-list
          >
        </div>`
      ]
    }
  ];
}
function getSinkIedElement(evt, doc) {
  const selectedItem = evt.target?.selected ?? [];
  return doc.querySelector(selector("IED", selectedItem.value));
}
function getSelectedSourceIedElements(evt, doc) {
  const selectedItems = (evt.target.parentElement?.querySelector("#sourcelist") ?? []).selected ?? [];
  return selectedItems.map((item) => doc.querySelector(selector("IED", item.value))).filter((item) => item !== null);
}
export function createConnectionWizard(doc) {
  return [
    {
      title: get("transform.comm-map.connectCB", {CbType: get("Report")}),
      secondary: {
        icon: "",
        label: get("cancel"),
        action: openCommunicationMappingWizard(doc)
      },
      content: doc.querySelectorAll(":root > IED").length > 1 ? [
        html` <div
                class="wrapper"
                style="display: grid; grid-template-columns: 1fr 1fr;"
              >
                <filtered-list
                  id="sourcelist"
                  multi
                  searchFieldLabel="${get("transform.comm-map.sourceIED")}"
                >
                  ${Array.from(doc.querySelectorAll(":root > IED") ?? []).map((ied) => html`<mwc-check-list-item left value="${identity(ied)}"
                        >${ied.getAttribute("name")}</mwc-check-list-item
                      >`)}
                </filtered-list>
                <filtered-list
                  id="sinklist"
                  searchFieldLabel="${get("transform.comm-map.sinkIED")}"
                  @selected="${(evt) => {
          evt.target.dispatchEvent(newWizardEvent(clientlnwizard(getSelectedSourceIedElements(evt, doc), getSinkIedElement(evt, doc))));
          evt.target.dispatchEvent(newWizardEvent());
        }}"
                >
                  ${Array.from(doc.querySelectorAll(":root > IED") ?? []).map((ied) => html`<mwc-list-item
                        style="height:56px"
                        value="${identity(ied)}"
                        >${ied.getAttribute("name")}</mwc-list-item
                      >`)}
                </filtered-list>
              </div>`
      ] : [
        html`
                <div style="display:flex">
                  <mwc-icon slot="graphic">info</mwc-icon
                  ><span style="margin-left:20px">No IEDs in the project</span>
                </div>
              `
      ]
    }
  ];
}
function sinkPrimary(sink) {
  const ln = (sink.getAttribute("prefix") ?? "") + sink.getAttribute("lnClass") + (sink.getAttribute("lnInst") ?? "");
  return sink.tagName === "ClientLN" ? ln : ln + ">" + sink.getAttribute("doName") + "." + (sink.getAttribute("daName") ?? "");
}
function sinkSecondary(sink) {
  return sink.tagName === "ClientLN" ? "" : sink.getAttribute("ldInst") ?? "";
}
function disconnectExtRefs(extRefs) {
  const actions = [];
  extRefs.forEach((extRef) => {
    const [intAddr, desc, serviceType, pServT, pLN, pDO, pDA] = [
      "intAddr",
      "desc",
      "serviceType",
      "pServT",
      "pLN",
      "pDO",
      "pDA"
    ].map((name) => extRef.getAttribute(name));
    if (intAddr) {
      const newExtRef = createElement(extRef.ownerDocument, "ExtRef", {
        intAddr,
        desc,
        serviceType,
        pServT,
        pLN,
        pDO,
        pDA
      });
      actions.push({
        new: {
          element: newExtRef
        },
        old: {
          element: extRef
        }
      });
    } else {
      actions.push({
        old: {
          parent: extRef.parentElement,
          element: extRef,
          reference: extRef.nextElementSibling
        }
      });
    }
  });
  const sinkReference = new Set();
  extRefs.forEach((extRef) => {
    findControlBlocks(extRef).forEach((cb) => {
      const ied = extRef.closest("IED")?.getAttribute("name");
      const ld = extRef.closest("LDevice")?.getAttribute("inst");
      const ap = extRef.closest("AccessPoint")?.getAttribute("name");
      const ln = extRef.closest("LN0") || extRef.closest("LN");
      const [prefix, lnClass, inst] = ["prefix", "lnClass", "inst"].map((name) => ln?.getAttribute(name));
      const iedNames = Array.from(cb.getElementsByTagName("IEDName")).filter((iedName) => iedName.textContent === ied && (iedName.getAttribute("apRef") || ap) === ap && (iedName.getAttribute("ldInst") || ld) === ld && (iedName.getAttribute("prefix") || prefix) === prefix && (iedName.getAttribute("lnClass") || lnClass) === lnClass && (iedName.getAttribute("lnInst") || inst) === inst);
      iedNames.forEach((iedName) => {
        sinkReference.add(iedName);
      });
    });
  });
  const sourceReferences = new Set();
  sinkReference.forEach((iedName) => {
    sourceReferences.clear();
    const target = findIEDNameTarget(iedName);
    if (target)
      getSourceReferences(target).forEach((sourceReference) => sourceReferences.add(sourceReference));
    extRefs.forEach((extRef) => sourceReferences.delete(extRef));
    if (sourceReferences.size === 0)
      actions.push({
        old: {
          parent: iedName.parentElement,
          element: iedName,
          reference: iedName.nextElementSibling
        }
      });
  });
  return actions;
}
function findIEDNameTarget(iedName) {
  const name = iedName.textContent ?? "";
  const [apRef, ldInst, prefix, lnClass, lnInst] = [
    "apRef",
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst"
  ].map((name2) => iedName.getAttribute(name2));
  const ied = iedName.ownerDocument.querySelector(`:root > IED[name=${name}]`);
  if (!ied)
    return null;
  const apRefSelector = apRef ? `AccessPoint[name="${apRef}"]` : "``";
  const ldInstSeletor = ldInst ? `LDevice[inst="${ldInst}"]` : "";
  const lnClassSelector = lnClass ? lnClass === "LLN0" ? `LN0` : `LN[lnClass="${lnClass}"]` : "";
  const prefixSelector = prefix ? `[prefix="${prefix}"]` : "";
  const lnInstSelector = lnInst ? `[inst="${lnInst}"]` : "";
  const selector2 = ` ${apRefSelector} ${ldInstSeletor} ${lnClassSelector}${prefixSelector}${lnInstSelector}`;
  return ied.querySelector(selector2);
}
function disconnect(connections, root) {
  return (inputs, wizard) => {
    const items = wizard.shadowRoot.querySelector("filtered-list").index;
    const actions = [];
    const selected = Array.from(items).map((index) => connections[index]);
    const selectedExtRefs = selected.filter((connection) => connection.tagName === "ExtRef");
    disconnectExtRefs(selectedExtRefs).forEach((action) => actions.push(action));
    const selectedClientLNs = selected.filter((connection) => connection.tagName === "ClientLN");
    selectedClientLNs.forEach((clientLN) => {
      actions.push({
        old: {
          parent: clientLN.parentElement,
          element: clientLN,
          reference: clientLN.nextElementSibling
        }
      });
    });
    actions.push(() => communicationMappingWizard(root));
    return actions;
  };
}
export function openCommunicationMappingWizard(root) {
  return () => [() => communicationMappingWizard(root)];
}
function cbConnectionWizard(connections, cbId, cbTag, iedName, root) {
  return [
    {
      title: cbId + " - " + iedName,
      primary: {
        icon: "delete",
        label: get("disconnect"),
        action: disconnect(connections, root)
      },
      secondary: {
        icon: "",
        label: get("cancel"),
        action: openCommunicationMappingWizard(root)
      },
      content: [
        html`<filtered-list multi
          >${connections.map((element) => html`<mwc-check-list-item graphic="icon" twoline>
                <span>${sinkPrimary(element)}</span
                ><span slot="secondary">${sinkSecondary(element)}</span>
                <mwc-icon slot="graphic"
                  >${element.tagName === "ClientLN" ? clientIcon : inputIcon}</mwc-icon
                >
              </mwc-check-list-item> `)}</filtered-list
        >`
      ]
    }
  ];
}
export function getSinkReferences(root) {
  return Array.from(root.getElementsByTagName("IEDName")).concat(Array.from(root.getElementsByTagName("ClientLN"))).filter((element) => !element.closest("Private"));
}
export function getSourceReferences(root) {
  return Array.from(root.getElementsByTagName("ExtRef")).filter((element) => !element.closest("Private")).filter((element) => element.getAttribute("iedName"));
}
export function openCreateConnection(doc) {
  return (inputs, wizard) => {
    return [() => createConnectionWizard(doc)];
  };
}
export function communicationMappingWizard(root) {
  const connections = new Map();
  const sourceRefs = getSourceReferences(root);
  const sinkRefs = getSinkReferences(root);
  sinkRefs.filter((element) => element.tagName === "ClientLN").forEach((element) => {
    const controlBlock = element.parentElement.parentElement;
    const iedName = element.getAttribute("iedName");
    const key = identity(controlBlock) + " | " + controlBlock.tagName + " | " + iedName;
    if (!connections.has(key))
      connections.set(key, []);
    connections.get(key)?.push(element);
    console.warn(key, element);
  });
  sourceRefs.forEach((element) => {
    const iedName = element.closest("IED")?.getAttribute("name") ?? "";
    const controlBlocks = findControlBlocks(element);
    controlBlocks.forEach((controlBlock) => {
      const key = identity(controlBlock) + " | " + controlBlock.tagName + " | " + iedName;
      if (!connections.has(key))
        connections.set(key, []);
      connections.get(key)?.push(element);
    });
    if (controlBlocks.size === 0) {
      const key = " |  | " + iedName;
      if (!connections.has(key))
        connections.set(key, []);
      connections.get(key)?.push(element);
    }
  });
  return [
    {
      title: get("transform.comm-map.wizard.title"),
      primary: {
        icon: "add",
        label: get("transform.comm-map.connectCB", {CbType: get("Report")}),
        action: openCreateConnection(root instanceof XMLDocument ? root : root.ownerDocument)
      },
      content: [
        html`<filtered-list
          >${Array.from(connections.keys()).map((key) => {
          const [cbId, cbTag, sinkIED] = key.split(" | ");
          const [_, sourceIED, controlBlock] = cbId.match(/^(.+)>>(.*)$/);
          return html`<mwc-list-item
              twoline
              graphic="icon"
              hasMeta
              @click="${(evt) => {
            evt.target.dispatchEvent(newWizardEvent(cbConnectionWizard(connections.get(key), cbId, cbTag, sinkIED, root)));
            evt.target.dispatchEvent(newWizardEvent());
          }}"
            >
              <span
                >${sourceIED}
                <mwc-icon style="--mdc-icon-size: 1em;">trending_flat</mwc-icon>
                ${sinkIED}</span
              >
              <span slot="secondary">${controlBlock}</span>
              <span slot="meta" style="padding-left: 10px"
                >${connections.get(key).length}</span
              >
              <mwc-icon slot="graphic">${controlBlockIcons[cbTag]}</mwc-icon>
            </mwc-list-item>`;
        })}</filtered-list
        >`
      ]
    }
  ];
}
export default class CommunicationMappingPlugin extends LitElement {
  async trigger() {
    this.dispatchEvent(newWizardEvent(communicationMappingWizard(this.doc)));
  }
}
