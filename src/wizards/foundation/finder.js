import {html} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../finder-list.js";
import {identity, isPublic, selector} from "../../foundation.js";
function getDisplayString(entry) {
  if (entry.startsWith("IED:"))
    return entry.replace(/^.*:/, "").trim();
  if (entry.startsWith("LN0:"))
    return "LLN0";
  return entry.replace(/^.*>/, "").trim();
}
function getReader(server, getChildren) {
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
function getIED(parent) {
  if (parent.tagName === "SCL")
    return Array.from(parent.querySelectorAll("IED")).filter(isPublic);
  return [];
}
export function iEDPicker(doc) {
  return html`<finder-list
    path="${JSON.stringify(["SCL: "])}"
    .read=${getReader(doc.querySelector("SCL"), getIED)}
    .getDisplayString=${getDisplayString}
    .getTitle=${(path) => path[path.length - 1]}
  ></finder-list>`;
}
export function getDataModelChildren(parent) {
  if (["LDevice", "Server"].includes(parent.tagName))
    return Array.from(parent.children).filter((child) => child.tagName === "LDevice" || child.tagName === "LN0" || child.tagName === "LN");
  const id = parent.tagName === "LN" || parent.tagName === "LN0" ? parent.getAttribute("lnType") : parent.getAttribute("type");
  return Array.from(parent.ownerDocument.querySelectorAll(`LNodeType[id="${id}"] > DO, DOType[id="${id}"] > SDO, DOType[id="${id}"] > DA, DAType[id="${id}"] > BDA`));
}
export function dataAttributePicker(server) {
  return html`<finder-list
    multi
    .paths=${[["Server: " + identity(server)]]}
    .read=${getReader(server, getDataModelChildren)}
    .getDisplayString=${getDisplayString}
    .getTitle=${(path) => path[path.length - 1]}
  ></finder-list>`;
}
