import {directive} from "../_snowpack/pkg/lit-html.js";
import {WizardTextField} from "./wizard-textfield.js";
export function isCreate(action) {
  return action.old === void 0 && action.new?.parent !== void 0 && action.new?.element !== void 0 && action.new?.reference !== void 0;
}
export function isDelete(action) {
  return action.old?.parent !== void 0 && action.old?.element !== void 0 && action.old?.reference !== void 0 && action.new === void 0;
}
export function isMove(action) {
  return action.old?.parent !== void 0 && action.old?.element !== void 0 && action.old?.reference !== void 0 && action.new?.parent !== void 0 && action.new?.element == void 0 && action.new?.reference !== void 0;
}
export function isUpdate(action) {
  return action.old?.parent === void 0 && action.old?.element !== void 0 && action.new?.parent === void 0 && action.new?.element !== void 0;
}
export function isSimple(action) {
  return !(action.actions instanceof Array);
}
export function invert(action) {
  if (!isSimple(action)) {
    const inverse = {
      title: action.title,
      derived: action.derived,
      actions: []
    };
    action.actions.forEach((element) => inverse.actions.unshift(invert(element)));
    return inverse;
  }
  const metaData = {
    derived: action.derived,
    checkValidity: action.checkValidity
  };
  if (isCreate(action))
    return {old: action.new, ...metaData};
  else if (isDelete(action))
    return {new: action.old, ...metaData};
  else if (isMove(action))
    return {
      old: {
        parent: action.new.parent,
        element: action.old.element,
        reference: action.new.reference
      },
      new: {parent: action.old.parent, reference: action.old.reference},
      ...metaData
    };
  else if (isUpdate(action))
    return {new: action.old, old: action.new, ...metaData};
  else
    return unreachable("Unknown EditorAction type in invert.");
}
export function newActionEvent(action, eventInitDict) {
  return new CustomEvent("editor-action", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {action, ...eventInitDict?.detail}
  });
}
export const wizardInputSelector = "wizard-textfield, mwc-select";
export function isWizard(wizardAction) {
  return typeof wizardAction === "function";
}
export function getValue(input) {
  if (input instanceof WizardTextField)
    return input.maybeValue;
  else
    return input.value;
}
export function getMultiplier(input) {
  if (input instanceof WizardTextField)
    return input.multiplier;
  else
    return null;
}
export function newWizardEvent(wizard = null, eventInitDict) {
  return new CustomEvent("wizard", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {wizard, ...eventInitDict?.detail}
  });
}
export function newLogEvent(detail, eventInitDict) {
  return new CustomEvent("log", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {...detail, ...eventInitDict?.detail}
  });
}
export function newPendingStateEvent(promise, eventInitDict) {
  return new CustomEvent("pending-state", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {promise, ...eventInitDict?.detail}
  });
}
export function referencePath(element) {
  let path = "";
  let nextParent = element.parentElement;
  while (nextParent?.getAttribute("name")) {
    path = "/" + nextParent.getAttribute("name") + path;
    nextParent = nextParent.parentElement;
  }
  return path;
}
export function pathParts(identity2) {
  const path = identity2.split(">");
  const end = path.pop() ?? "";
  const start = path.join(">");
  return [start, end];
}
function hitemIdentity(e) {
  return `${e.getAttribute("version")}	${e.getAttribute("revision")}`;
}
function hitemSelector(tagName, identity2) {
  const [version, revision] = identity2.split("	");
  return `${tagName}[version="${version}"][revision="${revision}"]`;
}
function terminalIdentity(e) {
  return identity(e.parentElement) + ">" + e.getAttribute("connectivityNode");
}
function terminalSelector(tagName, identity2) {
  const [parentIdentity, connectivityNode] = pathParts(identity2);
  const parentSelectors = tEquipment.flatMap((parentTag) => selector(parentTag, parentIdentity).split(","));
  return crossProduct(parentSelectors, [">"], [`${tagName}[connectivityNode="${connectivityNode}"]`]).map((strings) => strings.join("")).join(",");
}
function lNodeIdentity(e) {
  const [iedName, ldInst, prefix, lnClass, lnInst, lnType] = [
    "iedName",
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "lnType"
  ].map((name2) => e.getAttribute(name2));
  if (iedName === "None")
    return `${identity(e.parentElement)}>(${lnClass} ${lnType})`;
  return `${iedName} ${ldInst || "(Client)"}/${prefix ?? ""} ${lnClass} ${lnInst ?? ""}`;
}
function lNodeSelector(tagName, identity2) {
  if (identity2.endsWith(")")) {
    const [parentIdentity, myIdentity] = pathParts(identity2);
    const [lnClass2, lnType] = myIdentity.substring(1, identity2.length - 2).split(" ");
    return tLNodeContainer.map((parentTag) => `${selector(parentTag, parentIdentity)}>${tagName}[iedName="None"][lnClass="${lnClass2}"][lnType="${lnType}"]`).join(",");
  }
  const [iedName, ldInst, prefix, lnClass, lnInst] = identity2.split(/[ /]/);
  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  ] = [
    [`[iedName="${iedName}"]`],
    ldInst === "(Client)" ? [":not([ldInst])", '[ldInst=""]'] : [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [":not([lnInst])", '[lnInst=""]']
  ];
  return crossProduct([tagName], iedNameSelectors, ldInstSelectors, prefixSelectors, lnClassSelectors, lnInstSelectors).map((strings) => strings.join("")).join(",");
}
function kDCIdentity(e) {
  return `${identity(e.parentElement)}>${e.getAttribute("iedName")} ${e.getAttribute("apName")}`;
}
function kDCSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [iedName, apName] = myIdentity.split(" ");
  return `${selector("IED", parentIdentity)}>${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}
function associationIdentity(e) {
  return `${identity(e.parentElement)}>${e.getAttribute("associationID")}`;
}
function associationSelector(tagName, identity2) {
  const [parentIdentity, associationID] = pathParts(identity2);
  return `${selector("Server", parentIdentity)}>${tagName}[associationID="${associationID}"]`;
}
function lDeviceIdentity(e) {
  return `${identity(e.closest("IED"))}>>${e.getAttribute("inst")}`;
}
function lDeviceSelector(tagName, identity2) {
  const [iedName, inst] = identity2.split(">>");
  return `IED[name="${iedName}"] ${tagName}[inst="${inst}"]`;
}
function iEDNameIdentity(e) {
  const iedName = e.textContent;
  const [apRef, ldInst, prefix, lnClass, lnInst] = [
    "apRef",
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst"
  ].map((name2) => e.getAttribute(name2));
  return `${identity(e.parentElement)}>${iedName} ${apRef ? apRef : ""} ${ldInst ? ldInst : ""}/${prefix ?? ""} ${lnClass ?? ""} ${lnInst ?? ""}`;
}
function iEDNameSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [iedName, apRef, ldInst, prefix, lnClass, lnInst] = myIdentity.split(/[ /]/);
  const [
    parentSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  ] = [
    tControlWithIEDName.flatMap((parentTag) => selector(parentTag, parentIdentity).split(",")),
    [`${iedName}`],
    apRef ? [`[apRef="${apRef}"]`] : [":not([apRef])", '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [":not([ldInst])", '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [":not([lnInst])", '[lnInst=""]']
  ];
  return crossProduct(parentSelectors, [">"], [tagName], apRefSelectors, ldInstSelectors, prefixSelectors, lnClassSelectors, lnInstSelectors).map((strings) => strings.join("")).join(",");
}
function fCDAIdentity(e) {
  const [ldInst, prefix, lnClass, lnInst, doName, daName, fc, ix] = [
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName",
    "fc",
    "ix"
  ].map((name2) => e.getAttribute(name2));
  const dataPath = `${ldInst}/${prefix ?? ""} ${lnClass} ${lnInst ?? ""}.${doName} ${daName ? daName : ""}`;
  return `${identity(e.parentElement)}>${dataPath} (${fc}${ix ? " [" + ix + "]" : ""})`;
}
function fCDASelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [ldInst, prefix, lnClass, lnInst] = myIdentity.split(/[ /.]/);
  const matchDoDa = myIdentity.match(/.([A-Z][a-z0-9.]*) ([A-Za-z0-9.]*) \(/);
  const doName = matchDoDa && matchDoDa[1] ? matchDoDa[1] : "";
  const daName = matchDoDa && matchDoDa[2] ? matchDoDa[2] : "";
  const matchFx = myIdentity.match(/\(([A-Z]{2})/);
  const matchIx = myIdentity.match(/ \[([0-9]{1,2})\]/);
  const fc = matchFx && matchFx[1] ? matchFx[1] : "";
  const ix = matchIx && matchIx[1] ? matchIx[1] : "";
  const [
    parentSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    fcSelectors,
    ixSelectors
  ] = [
    selector("DataSet", parentIdentity).split(","),
    [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [":not([lnInst])", '[lnInst=""]'],
    [`[doName="${doName}"]`],
    daName ? [`[daName="${daName}"]`] : [":not([daName])", '[daName=""]'],
    [`[fc="${fc}"]`],
    ix ? [`[ix="${ix}"]`] : [":not([ix])", '[ix=""]']
  ];
  return crossProduct(parentSelectors, [">"], [tagName], ldInstSelectors, prefixSelectors, lnClassSelectors, lnInstSelectors, doNameSelectors, daNameSelectors, fcSelectors, ixSelectors).map((strings) => strings.join("")).join(",");
}
function extRefIdentity(e) {
  if (!e.parentElement)
    return NaN;
  const parentIdentity = identity(e.parentElement);
  const iedName = e.getAttribute("iedName");
  const intAddr = e.getAttribute("intAddr");
  const intAddrIndex = Array.from(e.parentElement.querySelectorAll(`ExtRef[intAddr="${intAddr}"]`)).indexOf(e);
  if (!iedName)
    return `${parentIdentity}>${intAddr}[${intAddrIndex}]`;
  const [
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
    serviceType,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst,
    srcCBName
  ] = [
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName",
    "serviceType",
    "srcLDInst",
    "srcPrefix",
    "srcLNClass",
    "srcLNInst",
    "srcCBName"
  ].map((name2) => e.getAttribute(name2));
  const cbPath = srcCBName ? `${serviceType}:${srcCBName} ${srcLDInst ?? ""}/${srcPrefix ?? ""} ${srcLNClass} ${srcLNInst ?? ""}` : "";
  const dataPath = `${iedName} ${ldInst}/${prefix ?? ""} ${lnClass} ${lnInst ?? ""} ${doName} ${daName ? daName : ""}`;
  return `${parentIdentity}>${cbPath} ${dataPath}${intAddr ? `@${intAddr}` : ""}`;
}
function extRefSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const parentSelectors = selector("Inputs", parentIdentity).split(",");
  if (myIdentity.endsWith("]")) {
    const [intAddr2] = myIdentity.split("[");
    const intAddrSelectors2 = [`[intAddr="${intAddr2}"]`];
    return crossProduct(parentSelectors, [">"], [tagName], intAddrSelectors2).map((strings) => strings.join("")).join(",");
  }
  let iedName, ldInst, prefix, lnClass, lnInst, doName, daName, serviceType, srcCBName, srcLDInst, srcPrefix, srcLNClass, srcLNInst, intAddr;
  if (!myIdentity.includes(":") && !myIdentity.includes("@")) {
    [
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName
    ] = myIdentity.split(/[ /]/);
  } else if (myIdentity.includes(":") && !myIdentity.includes("@")) {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName
    ] = myIdentity.split(/[ /:]/);
  } else if (!myIdentity.includes(":") && myIdentity.includes("@")) {
    [
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
      intAddr
    ] = myIdentity.split(/[ /@]/);
  } else {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
      intAddr
    ] = myIdentity.split(/[ /:@]/);
  }
  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    serviceTypeSelectors,
    srcCBNameSelectors,
    srcLDInstSelectors,
    srcPrefixSelectors,
    srcLNClassSelectors,
    srcLNInstSelectors,
    intAddrSelectors
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [":not([iedName])"],
    ldInst ? [`[ldInst="${ldInst}"]`] : [":not([ldInst])", '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    lnClass ? [`[lnClass="${lnClass}"]`] : [":not([lnClass])"],
    lnInst ? [`[lnInst="${lnInst}"]`] : [":not([lnInst])", '[lnInst=""]'],
    doName ? [`[doName="${doName}"]`] : [":not([doName])"],
    daName ? [`[daName="${daName}"]`] : [":not([daName])", '[daName=""]'],
    serviceType ? [`[serviceType="${serviceType}"]`] : [":not([serviceType])", '[serviceType=""]'],
    srcCBName ? [`[srcCBName="${srcCBName}"]`] : [":not([srcCBName])", '[srcCBName=""]'],
    srcLDInst ? [`[srcLDInst="${srcLDInst}"]`] : [":not([srcLDInst])", '[srcLDInst=""]'],
    srcPrefix ? [`[srcPrefix="${srcPrefix}"]`] : [":not([srcPrefix])", '[srcPrefix=""]'],
    srcLNClass ? [`[srcLNClass="${srcLNClass}"]`] : [":not([srcLNClass])", '[srcLNClass=""]'],
    srcLNInst ? [`[srcLNInst="${srcLNInst}"]`] : [":not([srcLNInst])", '[srcLNInst=""]'],
    intAddr ? [`[intAddr="${intAddr}"]`] : [":not([intAddr])", '[intAddr=""]']
  ];
  return crossProduct(parentSelectors, [">"], [tagName], iedNameSelectors, ldInstSelectors, prefixSelectors, lnClassSelectors, lnInstSelectors, doNameSelectors, daNameSelectors, serviceTypeSelectors, srcCBNameSelectors, srcLDInstSelectors, srcPrefixSelectors, srcLNClassSelectors, srcLNInstSelectors, intAddrSelectors).map((strings) => strings.join("")).join(",");
}
function lNIdentity(e) {
  const [prefix, lnClass, inst] = ["prefix", "lnClass", "inst"].map((name2) => e.getAttribute(name2));
  return `${identity(e.parentElement)}>${prefix ?? ""} ${lnClass} ${inst}`;
}
function lNSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const parentSelectors = ["AccessPoint", "LDevice"].flatMap((parentTag) => selector(parentTag, parentIdentity).split(","));
  const [prefix, lnClass, inst] = myIdentity.split(" ");
  const [prefixSelectors, lnClassSelectors, instSelectors] = [
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    [`[inst="${inst}"]`]
  ];
  return crossProduct(parentSelectors, [">"], [tagName], prefixSelectors, lnClassSelectors, instSelectors).map((strings) => strings.join("")).join(",");
}
function clientLNIdentity(e) {
  const [apRef, iedName, ldInst, prefix, lnClass, lnInst] = [
    "apRef",
    "iedName",
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst"
  ].map((name2) => e.getAttribute(name2));
  return `${identity(e.parentElement)}>${iedName} ${apRef ? apRef : ""} ${ldInst}/${prefix ?? ""} ${lnClass} ${lnInst}`;
}
function clientLNSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const parentSelectors = selector("RptEnabled", parentIdentity).split(",");
  const [iedName, apRef, ldInst, prefix, lnClass, lnInst] = myIdentity.split(/[ /]/);
  const [
    iedNameSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [":not([iedName])", '[iedName=""]'],
    apRef ? [`[apRef="${apRef}"]`] : [":not([apRef])", '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [":not([ldInst])", '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [":not([prefix])", '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [":not([lnInst])", '[lnInst=""]']
  ];
  return crossProduct(parentSelectors, [">"], [tagName], iedNameSelectors, apRefSelectors, ldInstSelectors, prefixSelectors, lnClassSelectors, lnInstSelectors).map((strings) => strings.join("")).join(",");
}
function ixNamingIdentity(e) {
  const [name2, ix] = ["name", "ix"].map((name3) => e.getAttribute(name3));
  return `${identity(e.parentElement)}>${name2}${ix ? "[" + ix + "]" : ""}`;
}
function ixNamingSelector(tagName, identity2, depth = -1) {
  if (depth === -1)
    depth = identity2.split(">").length;
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [name2] = myIdentity.split(" ");
  const ix = myIdentity.match(/\[([0-9]*)\]/) ? myIdentity.match(/\[([0-9]*)\]/)[1] : "";
  if (depth === 0)
    return `${tagName}[name="${name2}"]`;
  const parentSelectors = ["DOI", "SDI"].flatMap((parentTag) => parentTag === "SDI" ? ixNamingSelector(parentTag, parentIdentity, depth - 1).split(",") : selector(parentTag, parentIdentity).split(","));
  const [nameSelectors, ixSelectors] = [
    [`[name="${name2}"]`],
    ix ? [`[ix="${ix}"]`] : ['[ix=""]', ":not([ix])"]
  ];
  return crossProduct(parentSelectors, [">"], [tagName], nameSelectors, ixSelectors).map((strings) => strings.join("")).join(",");
}
function valIdentity(e) {
  if (!e.parentElement)
    return NaN;
  const sGroup = e.getAttribute("sGroup");
  const index = Array.from(e.parentElement.children).filter((child) => child.getAttribute("sGroup") === sGroup).findIndex((child) => child.isSameNode(e));
  return `${identity(e.parentElement)}>${sGroup ? sGroup + "." : ""} ${index}`;
}
function valSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [sGroup, indexText] = myIdentity.split(" ");
  const index = parseFloat(indexText);
  const parentSelectors = ["DAI", "DA", "BDA"].flatMap((parentTag) => selector(parentTag, parentIdentity).split(","));
  const [nameSelectors, ixSelectors] = [
    sGroup ? [`[sGroup="${sGroup}"]`] : [""],
    index ? [`:nth-child(${index + 1})`] : [""]
  ];
  return crossProduct(parentSelectors, [">"], [tagName], nameSelectors, ixSelectors).map((strings) => strings.join("")).join(",");
}
function connectedAPIdentity(e) {
  const [iedName, apName] = ["iedName", "apName"].map((name2) => e.getAttribute(name2));
  return `${iedName} ${apName}`;
}
function connectedAPSelector(tagName, identity2) {
  const [iedName, apName] = identity2.split(" ");
  return `${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}
function controlBlockIdentity(e) {
  const [ldInst, cbName] = ["ldInst", "cbName"].map((name2) => e.getAttribute(name2));
  return `${ldInst} ${cbName}`;
}
function controlBlockSelector(tagName, identity2) {
  const [ldInst, cbName] = identity2.split(" ");
  return `${tagName}[ldInst="${ldInst}"][cbName="${cbName}"]`;
}
function physConnIdentity(e) {
  if (!e.parentElement)
    return NaN;
  if (!e.parentElement.querySelector('PhysConn[type="RedConn"]'))
    return NaN;
  const pcType = e.getAttribute("type");
  if (e.parentElement.children.length > 1 && pcType !== "Connection" && pcType !== "RedConn")
    return NaN;
  return `${identity(e.parentElement)}>${pcType}`;
}
function physConnSelector(tagName, identity2) {
  const [parentIdentity, pcType] = pathParts(identity2);
  const [parentSelectors, typeSelectors] = [
    selector("ConnectedAP", parentIdentity).split(","),
    pcType ? [`[type="${pcType}"]`] : [""]
  ];
  return crossProduct(parentSelectors, [">"], [tagName], typeSelectors).map((strings) => strings.join("")).join(",");
}
function pIdentity(e) {
  if (!e.parentElement)
    return NaN;
  const eParent = e.parentElement;
  const eType = e.getAttribute("type");
  if (eParent.tagName === "PhysConn")
    return `${identity(e.parentElement)}>${eType}`;
  const index = Array.from(e.parentElement.children).filter((child) => child.getAttribute("type") === eType).findIndex((child) => child.isSameNode(e));
  return `${identity(e.parentElement)}>${eType} [${index}]`;
}
function pSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [type] = myIdentity.split(" ");
  const index = myIdentity && myIdentity.match(/\[([0-9]+)\]/) && myIdentity.match(/\[([0-9]+)\]/)[1] ? parseFloat(myIdentity.match(/\[([0-9]+)\]/)[1]) : NaN;
  const [parentSelectors, typeSelectors, ixSelectors] = [
    selector("Address", parentIdentity).split(","),
    [`[type="${type}"]`],
    index ? [`:nth-child(${index + 1})`] : [""]
  ];
  return crossProduct(parentSelectors, [">"], [tagName], typeSelectors, ixSelectors).map((strings) => strings.join("")).join(",");
}
function enumValIdentity(e) {
  return `${identity(e.parentElement)}>${e.getAttribute("ord")}`;
}
function enumValSelector(tagName, identity2) {
  const [parentIdentity, ord] = pathParts(identity2);
  return `${selector("EnumType", parentIdentity)}>${tagName}[ord="${ord}"]`;
}
function protNsIdentity(e) {
  return `${identity(e.parentElement)}>${e.getAttribute("type") || "8-MMS"}	${e.textContent}`;
}
function protNsSelector(tagName, identity2) {
  const [parentIdentity, myIdentity] = pathParts(identity2);
  const [type, value] = myIdentity.split("	");
  const [parentSelectors] = [
    ["DAType", "DA"].flatMap((parentTag) => selector(parentTag, parentIdentity).split(","))
  ];
  return crossProduct(parentSelectors, [">"], [tagName], [`[type="${type}"]`], [">"], [value]).map((strings) => strings.join("")).join(",");
}
export const specialTags = {
  Hitem: {identity: hitemIdentity, selector: hitemSelector},
  Terminal: {identity: terminalIdentity, selector: terminalSelector},
  LNode: {identity: lNodeIdentity, selector: lNodeSelector},
  KDC: {identity: kDCIdentity, selector: kDCSelector},
  Association: {identity: associationIdentity, selector: associationSelector},
  LDevice: {identity: lDeviceIdentity, selector: lDeviceSelector},
  IEDName: {identity: iEDNameIdentity, selector: iEDNameSelector},
  FCDA: {identity: fCDAIdentity, selector: fCDASelector},
  ExtRef: {identity: extRefIdentity, selector: extRefSelector},
  LN: {identity: lNIdentity, selector: lNSelector},
  ClientLN: {identity: clientLNIdentity, selector: clientLNSelector},
  DAI: {identity: ixNamingIdentity, selector: ixNamingSelector},
  SDI: {identity: ixNamingIdentity, selector: ixNamingSelector},
  Val: {identity: valIdentity, selector: valSelector},
  ConnectedAP: {identity: connectedAPIdentity, selector: connectedAPSelector},
  GSE: {identity: controlBlockIdentity, selector: controlBlockSelector},
  SMV: {identity: controlBlockIdentity, selector: controlBlockSelector},
  PhysConn: {identity: physConnIdentity, selector: physConnSelector},
  P: {identity: pIdentity, selector: pSelector},
  EnumVal: {identity: enumValIdentity, selector: enumValSelector},
  ProtNs: {identity: protNsIdentity, selector: protNsSelector}
};
function singletonIdentity(e) {
  return identity(e.parentElement).toString();
}
export const singletonTags = {
  AccessControl: ["LDevice"],
  Address: ["ConnectedAP", "GSE", "SMV"],
  Authentication: ["Server"],
  BitRate: ["SubNetwork"],
  ClientServices: ["Services"],
  CommProt: ["Services"],
  Communication: ["SCL"],
  ConfDataSet: ["Services"],
  ConfLdName: ["Services"],
  ConfLNs: ["Services"],
  ConfLogControl: ["Services"],
  ConfReportControl: ["Services"],
  ConfSG: ["SettingGroups"],
  ConfSigRef: ["Services"],
  DataObjectDirectory: ["Services"],
  DataSetDirectory: ["Services"],
  DataTypeTemplates: ["SCL"],
  DynAssociation: ["Services"],
  DynDataSet: ["Services"],
  FileHandling: ["Services"],
  GetCBValues: ["Services"],
  GetDataObjectDefinition: ["Services"],
  GetDataSetValue: ["Services"],
  GetDirectory: ["Services"],
  GOOSE: ["Services"],
  GSEDir: ["Services"],
  GSESettings: ["Services"],
  GSSE: ["Services"],
  Header: ["SCL"],
  History: ["Header"],
  Inputs: ["LN", "LN0"],
  IssuerName: ["GOOSESecurity", "SMVSecurity"],
  LN0: ["LDevice"],
  LogSettings: ["Services"],
  MaxTime: ["GSE"],
  McSecurity: ["GSESettings", "SMVSettings", "ClientServices"],
  MinTime: ["GSE"],
  OptFields: ["ReportControl"],
  Protocol: ["GSEControl", "SMVControl"],
  ReadWrite: ["Services"],
  RedProt: ["Services"],
  ReportSettings: ["Services"],
  RptEnabled: ["ReportControl"],
  SamplesPerSec: ["SMVSettings"],
  SecPerSamples: ["SMVSettings"],
  Server: ["AccessPoint"],
  ServerAt: ["AccessPoint"],
  Services: ["IED", "AccessPoint"],
  SetDataSetValue: ["Services"],
  SettingControl: ["LN0"],
  SettingGroups: ["Services"],
  SGEdit: ["SettingGroups"],
  SmpRate: ["SMVSettings"],
  SmvOpts: ["SampledValueControl"],
  SMVsc: ["Services"],
  SMVSettings: ["Services"],
  Subject: ["GOOSESecurity", "SMVSecurity"],
  SupSubscription: ["Services"],
  TimerActivatedControl: ["Services"],
  TimeSyncProt: ["Services"],
  TrgOps: ["ReportControl"],
  ValueHandling: ["Services"],
  Voltage: ["VoltageLevel"]
};
const tAbstractConductingEquipment = [
  "TransformerWinding",
  "ConductingEquipment"
];
const tEquipment = [
  "GeneralEquipment",
  "PowerTransformer",
  ...tAbstractConductingEquipment
];
const tEquipmentContainer = ["Substation", "VoltageLevel", "Bay"];
const tGeneralEquipmentContainer = ["Process", "Line"];
const tAbstractEqFuncSubFunc = ["EqSubFunction", "EqFunction"];
const tPowerSystemResource = [
  "SubFunction",
  "Function",
  "TapChanger",
  "SubEquipment",
  ...tEquipment,
  ...tEquipmentContainer,
  ...tGeneralEquipmentContainer,
  ...tAbstractEqFuncSubFunc
];
const tLNodeContainer = ["ConnectivityNode", ...tPowerSystemResource];
const tCertificate = ["GOOSESecurity", "SMVSecurity"];
const tNaming = ["SubNetwork", ...tCertificate, ...tLNodeContainer];
const tAbstractDataAttribute = ["BDA", "DA"];
const tControlWithIEDName = ["SampledValueControl", "GSEControl"];
const tControlWithTriggerOpt = ["LogControl", "ReportControl"];
const tControl = [...tControlWithIEDName, ...tControlWithTriggerOpt];
const tUnNaming = [
  "SDO",
  "DO",
  "DAI",
  "SDI",
  "DOI",
  "Log",
  "DataSet",
  "AccessPoint",
  "IED",
  ...tControl,
  ...tAbstractDataAttribute
];
const tAnyLN = ["LN0", "LN"];
export const namingParents = {
  SubNetwork: ["Communication"],
  GOOSESecurity: ["AccessPoint"],
  SMVSecurity: ["AccessPoint"],
  ConnectivityNode: ["Bay", "Line"],
  SubFunction: ["SubFunction", "Function"],
  Function: [
    "Bay",
    "VoltageLevel",
    "Substation",
    ...tGeneralEquipmentContainer
  ],
  TapChanger: ["TransformerWinding"],
  SubEquipment: [
    "TapChanger",
    "PowerTransformer",
    ...tAbstractConductingEquipment
  ],
  Process: ["Process", "SCL"],
  Line: ["Process", "SCL"],
  EqSubFunction: [...tAbstractEqFuncSubFunc],
  EqFunction: [
    "GeneralEquipment",
    "TapChanger",
    "TransformerWinding",
    "PowerTransformer",
    "SubEquipment",
    "ConductingEquipment"
  ],
  GeneralEquipment: [
    "SubFunction",
    "Function",
    ...tGeneralEquipmentContainer,
    ...tAbstractEqFuncSubFunc,
    ...tEquipmentContainer
  ],
  PowerTransformer: [...tEquipmentContainer],
  TransformerWinding: ["PowerTransformer"],
  ConductingEquipment: ["Process", "Line", "SubFunction", "Function", "Bay"],
  Bay: ["VoltageLevel"],
  VoltageLevel: ["Substation"],
  Substation: ["SCL", "Process"],
  SDO: ["DOType"],
  DO: ["LNodeType"],
  DAI: ["DOI", "SDI"],
  SDI: ["DOI", "SDI"],
  DOI: [...tAnyLN],
  Log: [...tAnyLN],
  DataSet: [...tAnyLN],
  AccessPoint: ["IED"],
  IED: ["SCL"],
  BDA: ["DAType"],
  DA: ["DOType"],
  SampledValueControl: ["LN0"],
  GSEControl: ["LN0"],
  LogControl: [...tAnyLN],
  ReportControl: [...tAnyLN]
};
function namingSelector(tagName, identity2, depth = -1) {
  if (depth === -1)
    depth = identity2.split(">").length;
  const [parentIdentity, name2] = pathParts(identity2);
  if (depth === 0)
    return `${tagName}[name="${name2}"]`;
  const parents = namingParents[tagName];
  if (!parents)
    return ":not(*)";
  const parentSelectors = parents.flatMap((parentTag) => namingParents[parentTag] ? namingSelector(parentTag, parentIdentity, depth - 1).split(",") : selector(parentTag, parentIdentity).split(","));
  return crossProduct(parentSelectors, [">"], [tagName], [`[name="${name2}"]`]).map((strings) => strings.join("")).join(",");
}
function singletonSelector(tagName, identity2) {
  const parents = singletonTags[tagName];
  if (!parents)
    return ":not(*)";
  const parentSelectors = parents.flatMap((parentTag) => selector(parentTag, identity2).split(","));
  return crossProduct(parentSelectors, [">"], [tagName]).map((strings) => strings.join("")).join(",");
}
export function selector(tagName, identity2) {
  if (typeof identity2 !== "string")
    return ":not(*)";
  if (singletonTags[tagName])
    return singletonSelector(tagName, identity2);
  if (specialTags[tagName])
    return specialTags[tagName]?.selector?.(tagName, identity2) ?? ":not(*)";
  if (namingParents[tagName])
    return namingSelector(tagName, identity2);
  if (identity2.startsWith("#"))
    return `${tagName}[id="${identity2.replace("#", "")}"]`;
  return tagName;
}
export function identity(e) {
  if (e === null)
    return NaN;
  if (e.closest("Private"))
    return NaN;
  if (singletonTags[e.tagName])
    return singletonIdentity(e);
  const specialIdentity = specialTags[e.tagName]?.identity;
  if (specialIdentity)
    return specialIdentity(e);
  if (e.id)
    return `#${e.id}`;
  if (e.hasAttribute("name") && e.parentElement)
    return e.parentElement.tagName === "SCL" ? e.getAttribute("name") : `${identity(e.parentElement)}>${e.getAttribute("name")}`;
  if (e.tagName === "SCL")
    return "";
  return NaN;
}
export function isSame(a, b) {
  if (a.tagName === "Private")
    return isSame(a.parentElement, b.parentElement) && a.isEqualNode(b);
  return a.tagName === b.tagName && identity(a) === identity(b);
}
export function isEqual(a, b) {
  if (a.closest("Private") || b.closest("Private"))
    return a.isEqualNode(b);
  const attributeNames = new Set(a.getAttributeNames().concat(b.getAttributeNames()));
  for (const name2 of attributeNames)
    if (a.getAttribute(name2) !== b.getAttribute(name2))
      return false;
  if (a.childElementCount === 0)
    return b.childElementCount === 0 && a.textContent?.trim() === b.textContent?.trim();
  const aChildren = Array.from(a.children);
  const bChildren = Array.from(b.children);
  for (const aChild of aChildren) {
    const twindex = bChildren.findIndex((bChild) => isEqual(aChild, bChild));
    if (twindex === -1)
      return false;
    bChildren.splice(twindex, 1);
  }
  for (const bChild of bChildren)
    if (!aChildren.find((aChild) => isEqual(bChild, aChild)))
      return false;
  return true;
}
export function createElement(doc, tag, attrs) {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs).filter(([_, value]) => value !== null).forEach(([name2, value]) => element.setAttribute(name2, value));
  return element;
}
export const ifImplemented = directive((rendered) => (part) => {
  if (Object.keys(rendered).length)
    part.setValue(rendered);
  else
    part.setValue("");
});
const nameStartChar = "[:_A-Za-z]|[\xC0-\xD6]|[\xD8-\xF6]|[\xF8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u{10000}\\-\u{EFFFF}]";
const nameChar = nameStartChar + "|[.0-9-]|\xB7|[\u0300-\u036F]|[\u203F-\u2040]";
const name = nameStartChar + "(" + nameChar + ")*";
const nmToken = "(" + nameChar + ")+";
export const restrictions = {
  string: "([	-\n]|[\r]|[ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  normalizedString: "([ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  name,
  nmToken,
  names: name + "( " + name + ")*",
  nmTokens: nmToken + "( " + nmToken + ")*",
  decimal: "((-|\\+)?([0-9]+(\\.[0-9]*)?|\\.[0-9]+))",
  unsigned: "\\+?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)"
};
export function compareNames(a, b) {
  if (typeof a === "string" && typeof b === "string")
    return a.localeCompare(b);
  if (typeof a === "object" && typeof b === "string")
    return a.getAttribute("name").localeCompare(b);
  if (typeof a === "string" && typeof b === "object")
    return a.localeCompare(b.getAttribute("name"));
  if (typeof a === "object" && typeof b === "object")
    return a.getAttribute("name").localeCompare(b.getAttribute("name"));
  return 0;
}
export function unreachable(message) {
  throw new Error(message);
}
export function crossProduct(...arrays) {
  return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())), [[]]);
}
export function findFCDAs(extRef) {
  if (extRef.tagName !== "ExtRef" || extRef.closest("Private"))
    return [];
  const [iedName, ldInst, prefix, lnClass, lnInst, doName, daName] = [
    "iedName",
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName"
  ].map((name2) => extRef.getAttribute(name2));
  const ied = Array.from(extRef.ownerDocument.getElementsByTagName("IED")).find((element) => element.getAttribute("name") === iedName && !element.closest("Private"));
  if (!ied)
    return [];
  return Array.from(ied.getElementsByTagName("FCDA")).filter((item) => !item.closest("Private")).filter((fcda) => (fcda.getAttribute("ldInst") ?? "") === (ldInst ?? "") && (fcda.getAttribute("prefix") ?? "") === (prefix ?? "") && (fcda.getAttribute("lnClass") ?? "") === (lnClass ?? "") && (fcda.getAttribute("lnInst") ?? "") === (lnInst ?? "") && (fcda.getAttribute("doName") ?? "") === (doName ?? "") && (fcda.getAttribute("daName") ?? "") === (daName ?? ""));
}
const serviceTypeControlBlockTags = {
  GOOSE: ["GSEControl"],
  SMV: ["SampledValueControl"],
  Report: ["ReportControl"],
  NONE: ["LogControl", "GSEControl", "SampledValueControl", "ReportControl"]
};
export function findControlBlocks(extRef) {
  const fcdas = findFCDAs(extRef);
  const cbTags = serviceTypeControlBlockTags[extRef.getAttribute("serviceType") ?? "NONE"] ?? [];
  const controlBlocks = new Set(fcdas.flatMap((fcda) => {
    const dataSet = fcda.parentElement;
    const dsName = dataSet.getAttribute("name") ?? "";
    const anyLN = dataSet.parentElement;
    return cbTags.flatMap((tag) => Array.from(anyLN.getElementsByTagName(tag))).filter((cb) => cb.getAttribute("datSet") === dsName);
  }));
  return controlBlocks;
}
