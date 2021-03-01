import {LitElement} from "../../_snowpack/pkg/lit-element.js";
import {get} from "../../_snowpack/pkg/lit-translate.js";
import {
  createElement,
  newActionEvent
} from "../foundation.js";
function getElementIndexOf(list, match) {
  for (let i = 0; list.length; i++)
    if (list[i]?.isEqualNode(match))
      return i;
  return -1;
}
function addIEDName(extRef, gseControl) {
  if (!extRef.parentElement?.parentElement?.getAttribute("lnClass"))
    return null;
  const ln = extRef.parentElement?.parentElement;
  if (!ln.parentElement?.getAttribute("inst"))
    return null;
  const lDevice = ln.parentElement;
  if (!lDevice.parentElement?.parentElement?.getAttribute("name"))
    return null;
  const accessPoint = lDevice.parentElement?.parentElement;
  if (!accessPoint.parentElement?.getAttribute("name"))
    return null;
  const ied = accessPoint.parentElement;
  if (Array.from(gseControl.querySelectorAll("IEDName")).filter((iedName2) => iedName2.getAttribute("apRef") === accessPoint.getAttribute("name") && iedName2.getAttribute("ldInst") === lDevice.getAttribute("inst") && iedName2.getAttribute("lnClass") === ln.getAttribute("lnClass") && iedName2.innerHTML === ied.getAttribute("name")).length !== 0)
    return null;
  const iedName = createElement(gseControl.ownerDocument, "IEDName", {
    apRef: accessPoint.getAttribute("name"),
    ldInst: lDevice.getAttribute("inst"),
    lnClass: ln.getAttribute("lnClass")
  });
  iedName.innerHTML = ied.getAttribute("name");
  return iedName;
}
function getDestination(data, doc) {
  if (!data.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement)
    return [];
  const sendIED = data.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
  if (!sendIED.getAttribute("name"))
    return [];
  const base = `ExtRef[iedName="${sendIED.getAttribute("name")}"][ldInst="${data.getAttribute("ldInst")}"][lnClass="${data.getAttribute("lnClass")}"][lnInst="${data.getAttribute("lnInst")}"][doName="${data.getAttribute("doName")}"]`;
  const prefix = data.getAttribute("prefix") ? `[prefix="${data.getAttribute("prefix")}"]` : "";
  return Array.from(doc.querySelectorAll(`:root > IED > AccessPoint > Server > LDevice > LN0 > Inputs > ${base}${prefix}, 
       :root > IED > AccessPoint > Server > LDevice > LN > Inputs > ${base}${prefix}`));
}
export function createMissingIEDNameSubscriberInfo(doc) {
  const gseControlList = Array.from(doc.querySelectorAll(":root > IED > AccessPoint > Server > LDevice > LN0 > GSEControl"));
  const simpleAction = [];
  gseControlList.forEach((gseControl) => {
    if (!gseControl.getAttribute("datSet") || !gseControl.parentElement)
      return simpleAction;
    const ln0 = gseControl.parentElement;
    const dataList = Array.from(ln0.querySelectorAll(`:root >  IED > AccessPoint > Server > LDevice > LN0 > DataSet[name="${gseControl.getAttribute("datSet")}"] > FCDA`));
    const destList = dataList.flatMap((data) => getDestination(data, doc)).filter((dest) => dest !== null).filter((v, i, a) => a.indexOf(v) === i);
    const iedNameList = destList.map((dest) => addIEDName(dest, gseControl)).filter((iedName) => iedName !== null).filter((v, i, a) => getElementIndexOf(a, v) === i);
    iedNameList.forEach((iedName) => {
      simpleAction.push({
        new: {parent: gseControl, element: iedName, reference: null}
      });
    });
  });
  return simpleAction;
}
export default class SubscriberInfoPlugin extends LitElement {
  async trigger() {
    const actions = createMissingIEDNameSubscriberInfo(this.doc);
    if (!actions.length)
      throw new Error(get("transform.subscriber.description") + get("transform.subscriber.nonewitems"));
    this.dispatchEvent(newActionEvent({
      title: get("transform.subscriber.description") + get("transform.subscriber.message", {
        updatenumber: actions.length
      }),
      actions
    }));
    return;
  }
}
