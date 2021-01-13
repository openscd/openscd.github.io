import {html} from "../../../web_modules/lit-html.js";
import {get, translate} from "../../../web_modules/lit-translate.js";
import "../../../web_modules/@material/mwc-list.js";
import "../../../web_modules/@material/mwc-list/mwc-check-list-item.js";
import "../../../web_modules/@material/mwc-textfield.js";
import {
  compareNames
} from "../../foundation.js";
let bayNum = 1;
let cbNum = 1;
let dsNum = 1;
function addLNode(condEq, cswi) {
  cswi.parentElement?.querySelectorAll(`LN[lnClass="CSWI"]${cswi.getAttribute("prefix") ? `[prefix="${cswi.getAttribute("prefix")}"]` : ``}${cswi.getAttribute("inst") ? `[inst="${cswi.getAttribute("inst")}"]` : ``},LN[lnClass="CILO"]${cswi.getAttribute("prefix") ? `[prefix="${cswi.getAttribute("prefix")}"]` : ``}${cswi.getAttribute("inst") ? `[inst="${cswi.getAttribute("inst")}"]` : ``},LN[lnClass="XCBR"]${cswi.getAttribute("prefix") ? `[prefix="${cswi.getAttribute("prefix")}"]` : ``}${cswi.getAttribute("inst") ? `[inst="${cswi.getAttribute("inst")}"]` : ``},LN[lnClass="XSWI"]${cswi.getAttribute("prefix") ? `[prefix="${cswi.getAttribute("prefix")}"]` : ``}${cswi.getAttribute("inst") ? `[inst="${cswi.getAttribute("inst")}"]` : ``}`).forEach((ln) => condEq.appendChild(new DOMParser().parseFromString(`<LNode iedName="${ln.parentElement?.parentElement?.parentElement?.parentElement?.getAttribute("name")}" ldInst="${cswi.parentElement?.getAttribute("inst")}" prefix="${ln.getAttribute("prefix") ? ln.getAttribute("prefix") : ""}" lnClass="${ln.getAttribute("lnClass")}" lnInst="${ln.getAttribute("inst") ? ln.getAttribute("inst") : ""}"></LNode>
          `, "application/xml").documentElement));
  return condEq;
}
function getSwitchGearType(cswi) {
  return cswi.parentElement?.querySelector(`LN[lnClass="XCBR"]${cswi.getAttribute("prefix") ? `[prefix="${cswi.getAttribute("prefix")}"]` : ``}${cswi.getAttribute("inst") ? `[inst="${cswi.getAttribute("inst")}"]` : ``}`) ? "CBR" : "DIS";
}
function getSwitchGearName(ln) {
  if (ln.getAttribute("prefix") && ln.getAttribute("inst"))
    return ln.getAttribute("prefix") + ln.getAttribute("inst");
  if (ln.getAttribute("inst") && getSwitchGearType(ln) === "CBR")
    return "QA" + cbNum++;
  return "QB" + dsNum++;
}
function isSwitchGear(ln, selectedCtlModel) {
  if (Array.from(ln.querySelectorAll('DOI[name="Pos"] > DAI[name="ctlModel"] > Val')).filter((val) => selectedCtlModel.includes(val.innerHTML.trim())).length)
    return true;
  const doc = ln.ownerDocument;
  return Array.from(doc.querySelectorAll(`DataTypeTemplates > LNodeType[id="${ln.getAttribute("lnType")}"] > DO[name="Pos"]`)).map((DO) => DO.getAttribute("type")).flatMap((doType) => Array.from(doc.querySelectorAll(`DOType[id="${doType}"] > DA[name="ctlModel"] > Val`))).filter((val) => selectedCtlModel.includes(val.innerHTML.trim())).length > 0;
}
function getCSWI(ied) {
  return Array.from(ied.querySelectorAll('AccessPoint > Server > LDevice > LN[lnClass="CSWI"]'));
}
function getValidCSWI(ied, selectedCtlModel) {
  if (!ied.parentElement)
    return [];
  return getCSWI(ied).filter((cswi) => isSwitchGear(cswi, selectedCtlModel));
}
function createBayElement(ied, ctlModelList) {
  const switchGear = getValidCSWI(ied, ctlModelList);
  cbNum = 1;
  dsNum = 1;
  if (switchGear.length) {
    const bayElement = new DOMParser().parseFromString(`<Bay name="Q${bayNum++}" desc="Bay for controller ${ied.getAttribute("name") ?? ""}"></Bay>`, "application/xml").documentElement;
    const condEq = switchGear.map((cswi) => {
      return addLNode(new DOMParser().parseFromString(`<ConductingEquipment name="${getSwitchGearName(cswi)}" type="${getSwitchGearType(cswi)}"></ConductingEquipment>`, "application/xml").documentElement, cswi);
    });
    condEq.forEach((condEq2) => bayElement.appendChild(condEq2));
    return bayElement;
  }
  return null;
}
function guessBasedOnCSWI(doc) {
  return (inputs, wizard) => {
    const actions = [];
    const ctlModelList = wizard.shadowRoot.querySelector("#ctlModelList").selected.map((item) => item.value);
    const root = doc.documentElement;
    const substation = root.querySelector(":root > Substation");
    const voltageLevel = new DOMParser().parseFromString(`<VoltageLevel name="E1" desc="guessed by OpenSCD"
                     nomFreq="50.0" numPhases="3">
        <Voltage unit="V" multiplier="k">110.00</Voltage>
      </VoltageLevel>`, "application/xml").documentElement;
    Array.from(doc.querySelectorAll(":root > IED")).sort(compareNames).map((ied) => createBayElement(ied, ctlModelList)).forEach((bay) => {
      if (bay)
        voltageLevel.appendChild(bay);
    });
    actions.push({
      new: {
        parent: substation,
        element: voltageLevel,
        reference: null
      }
    });
    wizard.close();
    return actions;
  };
}
export function guessVoltageLevel(doc) {
  return [
    {
      title: get("guess.wizard.title"),
      primary: {
        icon: "play_arrow",
        label: get("guess.wizard.primary"),
        action: guessBasedOnCSWI(doc)
      },
      content: [
        html`<p>${translate("guess.wizard.description")}</p>`,
        html`<mwc-list multi id="ctlModelList"
          ><mwc-check-list-item value="status-only"
            >status-only</mwc-check-list-item
          ><mwc-check-list-item value="direct-with-normal-security"
            >direct-with-normal-security</mwc-check-list-item
          ><mwc-check-list-item value="direct-with-enhanced-security"
            >direct-with-enhanced-security</mwc-check-list-item
          ><mwc-check-list-item value="sbo-with-normal-security"
            >sbo-with-normal-security</mwc-check-list-item
          ><mwc-check-list-item selected value="sbo-with-enhanced-security"
            >sbo-with-enhanced-security</mwc-check-list-item
          ></mwc-list
        >`
      ]
    }
  ];
}
