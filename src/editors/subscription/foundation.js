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
  getSclSchemaVersion,
  isPublic,
  minAvailableLogicalNodeInstance
} from "../../foundation.js";
import {
  createTemplateStructure,
  determineUninitializedStructure,
  initializeElements
} from "../../foundation/dai.js";
import {getFcdaReferences} from "../../foundation/ied.js";
import {SCL_NAMESPACE} from "../../schemas.js";
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
export function newFcdaSelectEvent(control, fcda, eventInitDict) {
  return new CustomEvent("fcda-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {control, fcda, ...eventInitDict?.detail}
  });
}
export function newSubscriptionChangedEvent(control, fcda, eventInitDict) {
  return new CustomEvent("subscription-changed", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {control, fcda, ...eventInitDict?.detail}
  });
}
export function getFcdaTitleValue(fcdaElement) {
  return `${fcdaElement.getAttribute("doName")}${fcdaElement.hasAttribute("doName") && fcdaElement.hasAttribute("daName") ? `.` : ``}${fcdaElement.getAttribute("daName")}`;
}
export function getFcdaSubtitleValue(fcdaElement) {
  return `${fcdaElement.getAttribute("ldInst")} ${fcdaElement.hasAttribute("ldInst") && fcdaElement.hasAttribute("prefix") ? `/` : ""} ${fcdaElement.getAttribute("prefix")} ${fcdaElement.getAttribute("lnClass")} ${fcdaElement.getAttribute("lnInst")}`;
}
export function existExtRef(parentInputs, fcda, control) {
  return !!getExtRef(parentInputs, fcda, control);
}
export function getExtRef(parentInputs, fcda, control) {
  function createCriteria(attributeName, value) {
    if (value) {
      return `[${attributeName}="${value}"]`;
    }
    return "";
  }
  const iedName = fcda.closest("IED")?.getAttribute("name");
  if (!iedName) {
    return void 0;
  }
  let controlCriteria = "";
  if (control && getSclSchemaVersion(fcda.ownerDocument) !== "2003") {
    controlCriteria = `[serviceType="${serviceTypes[control.tagName]}"]`;
    controlCriteria += createCriteria("srcLDInst", control.closest("LDevice")?.getAttribute("inst") ?? null);
    controlCriteria += createCriteria("srcLNClass", control.closest("LN0,LN")?.getAttribute("lnClass") ?? null);
    controlCriteria += createCriteria("srcLNInst", control.closest("LN0,LN")?.getAttribute("inst") ?? null);
    controlCriteria += createCriteria("srcCBName", control.getAttribute("name") ?? null);
  }
  return Array.from(parentInputs.querySelectorAll(`ExtRef[iedName="${iedName}"]${getFcdaReferences(fcda)}${controlCriteria}`)).find((extRefElement) => !extRefElement.hasAttribute("intAddr"));
}
export function canRemoveSubscriptionSupervision(subscribedExtRef) {
  const [srcCBName, srcLDInst, srcLNClass, iedName, srcPrefix, srcLNInst] = [
    "srcCBName",
    "srcLDInst",
    "srcLNClass",
    "iedName",
    "srcPrefix",
    "srcLNInst"
  ].map((attr) => subscribedExtRef.getAttribute(attr));
  return !Array.from(subscribedExtRef.closest("IED")?.getElementsByTagName("ExtRef") ?? []).filter(isPublic).some((extRef) => (extRef.getAttribute("srcCBName") ?? "") === (srcCBName ?? "") && (extRef.getAttribute("srcLDInst") ?? "") === (srcLDInst ?? "") && (extRef.getAttribute("srcLNClass") ?? "") === (srcLNClass ?? "") && (extRef.getAttribute("iedName") ?? "") === (iedName ?? "") && (extRef.getAttribute("srcPrefix") ?? "") === (srcPrefix ?? "") && (extRef.getAttribute("srcLNInst") ?? "") === (srcLNInst ?? "") && extRef !== subscribedExtRef);
}
function checksDataTypeTemplateConditions(lnElement) {
  const rootNode = lnElement?.ownerDocument;
  const lNodeType = lnElement.getAttribute("lnType");
  const lnClass = lnElement.getAttribute("lnClass");
  const dObj = rootNode.querySelector(`DataTypeTemplates > LNodeType[id="${lNodeType}"][lnClass="${lnClass}"] > DO[name="${lnClass === "LGOS" ? "GoCBRef" : "SvCBRef"}"]`);
  if (dObj) {
    const dORef = dObj.getAttribute("type");
    const daObj = rootNode.querySelector(`DataTypeTemplates > DOType[id="${dORef}"] > DA[name="setSrcRef"]`);
    if (daObj) {
      return (daObj.getAttribute("valKind") === "Conf" || daObj.getAttribute("valKind") === "RO") && daObj.getAttribute("valImport") === "true";
    }
  }
  return false;
}
export function instantiateSubscriptionSupervision(controlBlock, subscriberIED) {
  const supervisionType = controlBlock?.tagName === "GSEControl" ? "LGOS" : "LSVS";
  if (!controlBlock || !subscriberIED || !isSupervisionAllowed(controlBlock, subscriberIED, supervisionType))
    return [];
  const availableLN = findOrCreateAvailableLNInst(controlBlock, subscriberIED, supervisionType);
  if (!availableLN || !checksDataTypeTemplateConditions(availableLN))
    return [];
  const templateStructure = createTemplateStructure(availableLN, [
    controlBlock?.tagName === "GSEControl" ? "GoCBRef" : "SvCBRef",
    "setSrcRef"
  ]);
  if (!templateStructure)
    return [];
  const [parentElement, uninitializedTemplateStructure] = determineUninitializedStructure(availableLN, templateStructure);
  const newElement = initializeElements(uninitializedTemplateStructure);
  newElement.querySelector("Val").textContent = controlBlockReference(controlBlock);
  const createActions = [];
  if (!availableLN.parentElement) {
    const parent = subscriberIED.querySelector(`LN[lnClass="${supervisionType}"]`)?.parentElement;
    if (parent)
      createActions.push({
        new: {
          parent,
          element: availableLN
        }
      });
  }
  return createActions.concat([
    {
      new: {
        parent: parentElement,
        element: newElement
      }
    }
  ]);
}
export function removeSubscriptionSupervision(controlBlock, subscriberIED) {
  if (!controlBlock || !subscriberIED)
    return [];
  const supervisionType = controlBlock?.tagName === "GSEControl" ? "LGOS" : "LSVS";
  const valElement = Array.from(subscriberIED.querySelectorAll(`LN[lnClass="${supervisionType}"]>DOI>DAI>Val,LN0[lnClass="${supervisionType}"]>DOI>DAI>Val`)).find((val) => val.textContent == controlBlockReference(controlBlock));
  if (!valElement)
    return [];
  const lnElement = valElement.closest("LN0, LN");
  if (!lnElement || !lnElement.parentElement)
    return [];
  const isOpenScdCreated = lnElement.querySelector('Private[type="OpenSCD.create"]');
  return isOpenScdCreated ? [
    {
      old: {
        parent: lnElement.parentElement,
        element: lnElement
      }
    }
  ] : [
    {
      old: {
        parent: lnElement,
        element: valElement.closest("DOI")
      }
    }
  ];
}
function isSupervisionAllowed(controlBlock, subscriberIED, supervisionType) {
  if (getSclSchemaVersion(subscriberIED.ownerDocument) === "2003")
    return false;
  if (subscriberIED.querySelector(`LN[lnClass="${supervisionType}"]`) === null)
    return false;
  if (Array.from(subscriberIED.querySelectorAll(`LN[lnClass="${supervisionType}"]>DOI>DAI>Val`)).find((val) => val.textContent == controlBlockReference(controlBlock)))
    return false;
  if (maxSupervisions(subscriberIED, controlBlock) <= instantiatedSupervisionsCount(subscriberIED, controlBlock, supervisionType))
    return false;
  return true;
}
export function findOrCreateAvailableLNInst(controlBlock, subscriberIED, supervisionType) {
  let availableLN = Array.from(subscriberIED.querySelectorAll(`LN[lnClass="${supervisionType}"]`)).find((ln) => ln.querySelector("DOI>DAI>Val") === null || ln.querySelector("DOI>DAI>Val")?.textContent === "");
  if (!availableLN) {
    availableLN = subscriberIED.ownerDocument.createElementNS(SCL_NAMESPACE, "LN");
    const openScdTag = subscriberIED.ownerDocument.createElementNS(SCL_NAMESPACE, "Private");
    openScdTag.setAttribute("type", "OpenSCD.create");
    availableLN.appendChild(openScdTag);
    availableLN.setAttribute("lnClass", supervisionType);
    const instantiatedSibling = subscriberIED.querySelector(`LN[lnClass="${supervisionType}"]>DOI>DAI>Val`)?.closest("LN");
    if (!instantiatedSibling)
      return null;
    availableLN.setAttribute("lnType", instantiatedSibling.getAttribute("lnType") ?? "");
  }
  const inst = availableLN.getAttribute("inst") ?? "";
  if (inst === "") {
    const instNumber = minAvailableLogicalNodeInstance(Array.from(subscriberIED.querySelectorAll(`LN[lnClass="${supervisionType}"]`)));
    if (!instNumber)
      return null;
    availableLN.setAttribute("inst", instNumber);
  }
  return availableLN;
}
export function instantiatedSupervisionsCount(subscriberIED, controlBlock, supervisionType) {
  const instantiatedValues = Array.from(subscriberIED.querySelectorAll(`LN[lnClass="${supervisionType}"]>DOI>DAI>Val`)).filter((val) => val.textContent !== "");
  return instantiatedValues.length;
}
export function maxSupervisions(subscriberIED, controlBlock) {
  const maxAttr = controlBlock.tagName === "GSEControl" ? "maxGo" : "maxSv";
  const maxValues = parseInt(subscriberIED.querySelector("Services>SupSubscription")?.getAttribute(maxAttr) ?? "0", 10);
  return isNaN(maxValues) ? 0 : maxValues;
}
export function controlBlockReference(controlBlock) {
  if (!controlBlock)
    return null;
  const anyLn = controlBlock.closest("LN,LN0");
  const prefix = anyLn?.getAttribute("prefix") ?? "";
  const lnClass = anyLn?.getAttribute("lnClass");
  const lnInst = anyLn?.getAttribute("inst") ?? "";
  const ldInst = controlBlock.closest("LDevice")?.getAttribute("inst");
  const iedName = controlBlock.closest("IED")?.getAttribute("name");
  const cbName = controlBlock.getAttribute("name");
  if (!cbName && !iedName && !ldInst && !lnClass)
    return null;
  return `${iedName}${ldInst}/${prefix}${lnClass}${lnInst}.${cbName}`;
}
export function canCreateValidExtRef(fcda, controlBlock) {
  const iedName = fcda.closest("IED")?.getAttribute("name");
  const [ldInst, lnClass, lnInst, doName] = [
    "ldInst",
    "lnClass",
    "lnInst",
    "doName"
  ].map((attr) => fcda.getAttribute(attr));
  if (!iedName || !ldInst || !lnClass || !lnInst || !doName) {
    return false;
  }
  if (getSclSchemaVersion(fcda.ownerDocument) === "2003" || controlBlock === void 0) {
    return true;
  }
  const srcLDInst = controlBlock.closest("LDevice")?.getAttribute("inst");
  const srcLNClass = controlBlock.closest("LN0,LN")?.getAttribute("lnClass");
  const srcLNInst = controlBlock.closest("LN0,LN")?.getAttribute("inst");
  const srcCBName = controlBlock.getAttribute("name");
  return !(!srcLDInst || !srcLNClass || !srcCBName || typeof srcLNInst !== "string");
}
export const serviceTypes = {
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
