import {html} from "../../_snowpack/pkg/lit-element.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import "../finder-list.js";
import {
  createElement,
  identity,
  selector
} from "../foundation.js";
import {getChildren} from "./foundation/functions.js";
function newFCDA(parent, path) {
  const [leafTag, leafId] = path[path.length - 1].split(": ");
  const leaf = parent.ownerDocument.querySelector(selector(leafTag, leafId));
  if (!leaf || getChildren(leaf).length > 0)
    return;
  const lnSegment = path.find((segment) => segment.startsWith("LN"));
  if (!lnSegment)
    return;
  const [lnTag, lnId] = lnSegment.split(": ");
  const ln = parent.ownerDocument.querySelector(selector(lnTag, lnId));
  if (!ln)
    return;
  const iedName = ln.closest("IED")?.getAttribute("name");
  const ldInst = ln.closest("LDevice")?.getAttribute("inst");
  const prefix = ln.getAttribute("prefix") ?? "";
  const lnClass = ln.getAttribute("lnClass");
  const lnInst = ln.getAttribute("inst") ?? "";
  let doName = "";
  let daName = "";
  let fc = "";
  for (const segment of path) {
    const [tagName, id] = segment.split(": ");
    if (!["DO", "DA", "SDO", "BDA"].includes(tagName))
      continue;
    const element = parent.ownerDocument.querySelector(selector(tagName, id));
    if (!element)
      return;
    const name = element.getAttribute("name");
    if (tagName === "DO")
      doName = name;
    if (tagName === "SDO")
      doName = doName + "." + name;
    if (tagName === "DA") {
      daName = name;
      fc = element.getAttribute("fc") ?? "";
    }
    if (tagName === "BDA")
      daName = daName + "." + name;
  }
  if (!iedName || !ldInst || !lnClass || !doName || !daName || !fc)
    return;
  return createElement(parent.ownerDocument, "FCDA", {
    iedName,
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
    fc
  });
}
function createFCDAsAction(parent) {
  return (inputs, wizard) => {
    const finder = wizard.shadowRoot.querySelector("finder-list");
    const paths = finder?.paths ?? [];
    const actions = [];
    for (const path of paths) {
      const element = newFCDA(parent, path);
      if (!element)
        continue;
      actions.push({
        new: {
          parent,
          element,
          reference: null
        }
      });
    }
    return actions;
  };
}
function getDisplayString(entry) {
  return entry.replace(/^.*>/, "").trim();
}
function getReader(server) {
  return async (path) => {
    const [tagName, id] = path[path.length - 1]?.split(": ", 2);
    const element = server.ownerDocument.querySelector(selector(tagName, id));
    if (!element)
      return {path, header: html`<p>${translate("error")}</p>`, entries: []};
    return {
      path,
      header: void 0,
      entries: getChildren(element).map((child) => `${child.tagName}: ${identity(child)}`)
    };
  };
}
export function createFCDAsWizard(parent) {
  const server = parent.closest("Server");
  if (!server)
    return;
  return [
    {
      title: get("wizard.title.add", {tagName: "FCDA"}),
      primary: {
        label: "add",
        icon: "add",
        action: createFCDAsAction(parent)
      },
      content: [
        html`<finder-list
          multi
          .paths=${[["Server: " + identity(server)]]}
          .read=${getReader(server)}
          .getDisplayString=${getDisplayString}
          .getTitle=${(path) => path[path.length - 1]}
        ></finder-list>`
      ]
    }
  ];
}
