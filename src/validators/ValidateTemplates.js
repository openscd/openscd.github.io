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
import {LitElement, property} from "../../_snowpack/pkg/lit-element.js";
import {identity, newLogEvent} from "../foundation.js";
const iec6185074 = fetch("public/xml/IEC_61850-7-4_2007B3.nsd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
const iec6185073 = fetch("public/xml/IEC_61850-7-3_2007B3.nsd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
const iec6185072 = fetch("public/xml/IEC_61850-7-2_2007B3.nsd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
const iec6185081 = fetch("public/xml/IEC_61850-8-1_2003A2.nsd").then((response) => response.text()).then((str) => new DOMParser().parseFromString(str, "application/xml"));
const serviceCDCs = ["SPC", "DPC", "INC", "ENC", "BSC", "ISC", "APC", "BAC"];
async function validateCoOperStructure(oper) {
  const type = oper.getAttribute("type");
  if (!type)
    return [];
  const datype = oper.closest("DataTypeTemplates")?.querySelector(`DAType[id="${type}"]`) ?? null;
  const nsd81 = await iec6185081;
  const errors = [];
  const mendatoryDAs = Array.from(nsd81.querySelectorAll(`ServiceConstructedAttributes > ServiceConstructedAttribute[name="Oper"] > SubDataAttribute[presCond="M"]`)).map((data) => data.getAttribute("name"));
  for (const mendatoryDA of mendatoryDAs)
    if (datype && !datype.querySelector(`BDA[name="${mendatoryDA}"]`))
      errors.push({
        title: `Data structure SBOw is missing mandatory data ${mendatoryDA}`,
        kind: "error",
        message: `${identity(datype)}`
      });
  return errors;
}
async function validateCoSBOwStructure(sbow) {
  const type = sbow.getAttribute("type");
  if (!type)
    return [];
  const datype = sbow.closest("DataTypeTemplates")?.querySelector(`DAType[id="${type}"]`) ?? null;
  const nsd81 = await iec6185081;
  const errors = [];
  const mendatoryDAs = Array.from(nsd81.querySelectorAll(`ServiceConstructedAttributes > ServiceConstructedAttribute[name="SBOw"] > SubDataAttribute[presCond="M"]`)).map((data) => data.getAttribute("name"));
  for (const mendatoryDA of mendatoryDAs)
    if (datype && !datype.querySelector(`BDA[name="${mendatoryDA}"]`))
      errors.push({
        title: `Data structure SBOw is missing mandatory data ${mendatoryDA}`,
        kind: "error",
        message: `${identity(datype)}`
      });
  return errors;
}
async function validateCoCancelStructure(cancel) {
  const type = cancel.getAttribute("type");
  if (!type)
    return [];
  const datype = cancel.closest("DataTypeTemplates")?.querySelector(`DAType[id="${type}"]`) ?? null;
  const nsd81 = await iec6185081;
  const errors = [];
  const mendatoryDAs = Array.from(nsd81.querySelectorAll(`ServiceConstructedAttributes > ServiceConstructedAttribute[name="Cancel"] > SubDataAttribute[presCond="M"]`)).map((data) => data.getAttribute("name"));
  for (const mendatoryDA of mendatoryDAs)
    if (datype && !datype.querySelector(`BDA[name="${mendatoryDA}"]`))
      errors.push({
        title: `Data structure Cancel is missing mandatory data ${mendatoryDA}`,
        kind: "error",
        message: `${identity(datype)}`
      });
  return errors;
}
function missingCoDataToLog(reference, type) {
  return {
    title: `Controlable data objects ${type} is missing`,
    kind: "error",
    message: `${reference}`
  };
}
export async function validateControlCDC(dotype) {
  if (dotype.getAttribute("cdc") && !serviceCDCs.includes(dotype.getAttribute("cdc")))
    return [];
  let errors = [];
  const ctlModel = dotype.querySelector('DA[name="ctlModel"] > Val')?.innerHTML;
  const oper = dotype.querySelector('DA[fc="CO"][name="Oper"][bType="Struct"]');
  const sbo = dotype.querySelector('DA[fc="CO"][name="SBO"][bType="ObjRef"]');
  const cancel = dotype.querySelector('DA[fc="CO"][name="Cancel"][bType="Struct"]');
  const sbow = dotype.querySelector('DA[fc="CO"][name="SBOw"][bType="Struct"]');
  if (ctlModel === "sbo-with-enhanced-security") {
    const errorsSBOw = sbow ? await validateCoSBOwStructure(sbow) : [missingCoDataToLog(identity(dotype), "SBOw")];
    const errorsCancel = cancel ? await validateCoCancelStructure(cancel) : [missingCoDataToLog(identity(dotype), "Cancel")];
    errors = errorsSBOw.concat(errorsCancel);
  } else if (ctlModel === "sbo-with-normal-security") {
    errors = cancel ? await validateCoCancelStructure(cancel) : [missingCoDataToLog(identity(dotype), "Cancel")];
    if (!sbo)
      errors.push(missingCoDataToLog(identity(dotype), "SBO"));
  } else if (ctlModel !== "status-only") {
    errors = oper ? await validateCoOperStructure(oper) : [missingCoDataToLog(identity(dotype), "Oper")];
  }
  return errors;
}
async function getMendatorySubDataAttributes(datype) {
  const parentDAs = Array.from(datype.closest("DataTypeTemplates").querySelectorAll(`DOType > DA[type="${datype.getAttribute("id")}"]`)) ?? [];
  const nsd = await iec6185073;
  const dataAttributes = parentDAs.map((parentDA) => {
    const parentCDC = parentDA.parentElement;
    return nsd.querySelector(`CDC[name="${parentCDC.getAttribute("cdc")}"] > DataAttribute[name="${parentDA.getAttribute("name")}"]`);
  });
  const type = dataAttributes.filter((data) => data && data.getAttribute("typeKind") === "CONSTRUCTED").map((data) => data?.getAttribute("type") ?? "").filter((type2) => type2 !== "");
  return Array.from(nsd.querySelectorAll(`ConstructedAttributes > ConstructedAttribute[name="${type[0]}"] > SubDataAttribute[presCond="M"]`)) ?? [];
}
export async function validateMandatorySubDAs(datype) {
  const mandatorysubdas = await (await getMendatorySubDataAttributes(datype)).map((DA) => DA.getAttribute("name"));
  const errors = [];
  mandatorysubdas.forEach((mandatorysubda) => {
    if (!datype.querySelector(`BDA[name="${mandatorysubda}"]`))
      errors.push({
        title: `The element DA ${mandatorysubda} is mendatory DAType ${datype.getAttribute("id")}`,
        kind: "error",
        message: `${datype}`
      });
  });
  return errors;
}
async function getMendatoryDataAttribute(base) {
  const nsd = await iec6185073;
  const cdc = nsd.querySelector(`CDC[name="${base}"]`);
  if (!cdc)
    return [];
  return Array.from(cdc.querySelectorAll('DataAttribute[presCond="M"]'));
}
export async function validateMandatoryDAs(dotype) {
  const errors = [];
  const cdc = dotype.getAttribute("cdc");
  if (!cdc)
    return [];
  const mandatorydas = await (await getMendatoryDataAttribute(cdc)).map((DA) => DA.getAttribute("name"));
  mandatorydas.forEach((mandatoryda) => {
    if (!dotype.querySelector(`DA[name="${mandatoryda}"]`))
      errors.push({
        title: `The element DA ${mandatoryda} is mendatory in Common Data Class ${cdc}`,
        kind: "error",
        message: `${identity(dotype)}`
      });
  });
  return errors;
}
function getAdjacentClass(nsd, base) {
  if (base === "")
    return [];
  const adjacents = getAdjacentClass(nsd, nsd.querySelector(`LNClass[name="${base}"], AbstractLNClass[name="${base}"]`)?.getAttribute("base") ?? "");
  return Array.from(nsd.querySelectorAll(`LNClass[name="${base}"], AbstractLNClass[name="${base}"]`)).concat(adjacents);
}
async function getAllDataObject(base) {
  const lnodeclasses = getAdjacentClass(await iec6185074, base);
  return lnodeclasses.flatMap((lnodeclass) => Array.from(lnodeclass.querySelectorAll("DataObject")));
}
export async function validateDoCDCSetting(lnodetype) {
  const errors = [];
  const lnClass = lnodetype.getAttribute("lnClass");
  if (!lnClass)
    return [];
  const alldos = await getAllDataObject(lnClass);
  for (const DO of alldos) {
    const type = lnodetype.querySelector(`DO[name="${DO.getAttribute("name")}"]`)?.getAttribute("type");
    if (!type)
      continue;
    const dOType = lnodetype.closest("DataTypeTemplates")?.querySelector(`DOType[id="${type}"]`);
    if (!dOType) {
      errors.push({
        title: `Cannot validate data object ${DO.getAttribute("name")} in LNodeType ${lnClass}`,
        kind: "warning",
        message: `${identity(lnodetype)}`
      });
      continue;
    }
    if (dOType.getAttribute("cdc") !== DO.getAttribute("type"))
      errors.push({
        title: `The element DOs ${DO.getAttribute("name")} class definition ${dOType.getAttribute("cdc")} is expected to be ${DO.getAttribute("type")}`,
        kind: "error",
        message: `${identity(dOType)} > ${DO.getAttribute("name")}`
      });
  }
  return errors;
}
async function getMendatoryDataObject(base) {
  const lnodeclasses = getAdjacentClass(await iec6185074, base);
  return lnodeclasses.flatMap((lnodeclass) => Array.from(lnodeclass.querySelectorAll('DataObject[presCond="M"]')));
}
export async function validateMandatoryDOs(lnodetype) {
  const errors = [];
  const lnClass = lnodetype.getAttribute("lnClass");
  if (!lnClass)
    return [];
  const mandatorydos = await (await getMendatoryDataObject(lnClass)).map((DO) => DO.getAttribute("name"));
  mandatorydos.forEach((mandatorydo) => {
    if (!lnodetype.querySelector(`DO[name="${mandatorydo}"]`))
      errors.push({
        title: `The element DO ${mandatorydo} is mendatory in LN Class ${lnClass}`,
        kind: "error",
        message: `${identity(lnodetype)} > ${mandatorydo}`
      });
  });
  return errors;
}
export default class ValidateTemplates extends LitElement {
  async validate() {
    const promises = [];
    for (const lnodetype of Array.from(this.doc.querySelectorAll("LNodeType"))) {
      promises.push(validateMandatoryDOs(lnodetype).then((errors) => {
        errors.forEach((error) => document.querySelector("open-scd")?.dispatchEvent(newLogEvent(error)));
      }));
      promises.push(validateDoCDCSetting(lnodetype).then((errors) => {
        errors.forEach((error) => document.querySelector("open-scd")?.dispatchEvent(newLogEvent(error)));
      }));
    }
    for (const dotype of Array.from(this.doc.querySelectorAll("DOType"))) {
      promises.push(validateMandatoryDAs(dotype).then((errors) => {
        errors.forEach((error) => document.querySelector("open-scd")?.dispatchEvent(newLogEvent(error)));
      }));
      promises.push(validateControlCDC(dotype).then((errors) => {
        errors.forEach((error) => document.querySelector("open-scd")?.dispatchEvent(newLogEvent(error)));
      }));
    }
    for (const datype of Array.from(this.doc.querySelectorAll("DAType")))
      promises.push(validateMandatorySubDAs(datype).then((errors) => {
        errors.forEach((error) => document.querySelector("open-scd")?.dispatchEvent(newLogEvent(error)));
      }));
    await Promise.allSettled(promises);
  }
}
__decorate([
  property()
], ValidateTemplates.prototype, "doc", 2);
__decorate([
  property()
], ValidateTemplates.prototype, "docName", 2);
