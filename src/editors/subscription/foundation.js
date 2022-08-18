var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {css, LitElement, query} from "../../../_snowpack/pkg/lit-element.js";
import {
  cloneElement,
  compareNames,
  createElement,
  getSclSchemaVersion
} from "../../foundation.js";
import {getFcdaReferences} from "../../foundation/ied.js";
export var View;
(function(View2) {
  View2[View2["PUBLISHER"] = 0] = "PUBLISHER";
  View2[View2["SUBSCRIBER"] = 1] = "SUBSCRIBER";
})(View || (View = {}));
export var SubscribeStatus;
(function(SubscribeStatus2) {
  SubscribeStatus2[SubscribeStatus2["Full"] = 0] = "Full";
  SubscribeStatus2[SubscribeStatus2["Partial"] = 1] = "Partial";
  SubscribeStatus2[SubscribeStatus2["None"] = 2] = "None";
})(SubscribeStatus || (SubscribeStatus = {}));
export function newViewEvent(view, eventInitDict) {
  return new CustomEvent("view", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {view, ...eventInitDict?.detail}
  });
}
export function newIEDSelectEvent(ied, eventInitDict) {
  return new CustomEvent("ied-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {ied, ...eventInitDict?.detail}
  });
}
export function existExtRef(parentInputs, fcda) {
  const iedName = fcda.closest("IED")?.getAttribute("name");
  if (!iedName)
    return false;
  return !!parentInputs.querySelector(`ExtRef[iedName=${iedName}]${getFcdaReferences(fcda)}`);
}
export function canCreateValidExtRef(fcda, controlBlock) {
  const iedName = fcda.closest("IED")?.getAttribute("name");
  const [ldInst, lnClass, lnInst, doName] = [
    "ldInst",
    "lnClass",
    "lnInst",
    "doName"
  ].map((attr) => fcda.getAttribute(attr));
  if (!iedName || !ldInst || !lnClass || !lnInst || !doName)
    return false;
  if (controlBlock === void 0)
    return true;
  const srcLDInst = controlBlock.closest("LDevice")?.getAttribute("inst");
  const srcLNClass = controlBlock.closest("LN0,LN")?.getAttribute("lnClass");
  const srcLNInst = controlBlock.closest("LN0,LN")?.getAttribute("inst");
  const srcCBName = controlBlock.getAttribute("name");
  if (!srcLDInst || !srcLNClass || !srcCBName || typeof srcLNInst !== "string")
    return false;
  return true;
}
const serviceTypes = {
  ReportControl: "Report",
  GSEControl: "GOOSE",
  SampledValueControl: "SMV"
};
export function createExtRefElement(controlElement, fcdaElement) {
  const iedName = fcdaElement.closest("IED")?.getAttribute("name") ?? null;
  const [ldInst, prefix, lnClass, lnInst, doName, daName] = [
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName"
  ].map((attr) => fcdaElement.getAttribute(attr));
  if (getSclSchemaVersion(fcdaElement.ownerDocument) === "2003") {
    return createElement(fcdaElement.ownerDocument, "ExtRef", {
      iedName,
      ldInst,
      lnClass,
      lnInst,
      prefix,
      doName,
      daName
    });
  }
  if (!controlElement || !serviceTypes[controlElement.tagName]) {
    return createElement(fcdaElement.ownerDocument, "ExtRef", {
      iedName,
      serviceType: "Poll",
      ldInst,
      lnClass,
      lnInst,
      prefix,
      doName,
      daName
    });
  }
  const srcLDInst = controlElement.closest("LDevice")?.getAttribute("inst") ?? "";
  const srcPrefix = controlElement.closest("LN0,LN")?.getAttribute("prefix") ?? "";
  const srcLNClass = controlElement.closest("LN0,LN")?.getAttribute("lnClass") ?? "";
  const srcLNInst = controlElement.closest("LN0,LN")?.getAttribute("inst");
  const srcCBName = controlElement.getAttribute("name") ?? "";
  return createElement(fcdaElement.ownerDocument, "ExtRef", {
    iedName,
    serviceType: serviceTypes[controlElement.tagName],
    ldInst,
    lnClass,
    lnInst,
    prefix,
    doName,
    daName,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst: srcLNInst ? srcLNInst : null,
    srcCBName
  });
}
export function updateExtRefElement(extRefElement, controlElement, fcdaElement) {
  const iedName = fcdaElement.closest("IED")?.getAttribute("name") ?? null;
  const [ldInst, prefix, lnClass, lnInst, doName, daName] = [
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName"
  ].map((attr) => fcdaElement.getAttribute(attr));
  if (getSclSchemaVersion(fcdaElement.ownerDocument) === "2003") {
    return cloneElement(extRefElement, {
      iedName,
      serviceType: null,
      ldInst,
      lnClass,
      lnInst,
      prefix,
      doName,
      daName,
      srcLDInst: null,
      srcPrefix: null,
      srcLNClass: null,
      srcLNInst: null,
      srcCBName: null
    });
  }
  if (!controlElement || !serviceTypes[controlElement.tagName]) {
    return cloneElement(extRefElement, {
      iedName,
      serviceType: "Poll",
      ldInst,
      lnClass,
      lnInst,
      prefix,
      doName,
      daName,
      srcLDInst: null,
      srcPrefix: null,
      srcLNClass: null,
      srcLNInst: null,
      srcCBName: null
    });
  }
  const srcLDInst = controlElement.closest("LDevice")?.getAttribute("inst") ?? "";
  const srcPrefix = controlElement.closest("LN0,LN")?.getAttribute("prefix") ?? "";
  const srcLNClass = controlElement.closest("LN0,LN")?.getAttribute("lnClass") ?? "";
  const srcLNInst = controlElement.closest("LN0,LN")?.getAttribute("inst");
  const srcCBName = controlElement.getAttribute("name") ?? "";
  return cloneElement(extRefElement, {
    iedName,
    serviceType: serviceTypes[controlElement.tagName],
    ldInst,
    lnClass,
    lnInst,
    prefix,
    doName,
    daName,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst: srcLNInst ? srcLNInst : null,
    srcCBName
  });
}
export function getOrderedIeds(doc) {
  return doc ? Array.from(doc.querySelectorAll(":root > IED")).sort((a, b) => compareNames(a, b)) : [];
}
export class SubscriberListContainer extends LitElement {
  constructor() {
    super(...arguments);
    this.subscribedElements = [];
    this.availableElements = [];
  }
  updated() {
    if (this.subscriberWrapper) {
      this.subscriberWrapper.scrollTo(0, 0);
    }
  }
  resetElements() {
    this.subscribedElements = [];
    this.availableElements = [];
  }
}
__decorate([
  query("div")
], SubscriberListContainer.prototype, "subscriberWrapper", 2);
export const styles = css`
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

  mwc-list-item[noninteractive] {
    font-weight: 500;
  }
`;
