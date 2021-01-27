import {get} from "../web_modules/lit-translate.js";
import {
  newLogEvent,
  newActionEvent,
  createElement
} from "./foundation.js";
export function Importing(Base) {
  class ImportingElement extends Base {
    addLNodeType(lNodeType, doc) {
      const existLNodeType = doc.querySelector(`:root > DataTypeTemplates > LNodeType[id="${lNodeType.getAttribute("id")}"]`);
      if (existLNodeType && lNodeType.isEqualNode(existLNodeType))
        return;
      if (existLNodeType) {
        const ied = lNodeType.parentElement.parentElement.querySelector(":root > IED");
        const idOld = lNodeType.getAttribute("id");
        const idNew = ied.getAttribute("name").concat(idOld);
        lNodeType.setAttribute("id", idNew);
        ied.querySelectorAll(`AccessPoint > Server > LDevice > LN0[lnType="${idOld}"], AccessPoint > Server > LDevice > LN[lnType="${idOld}"]`).forEach((ln) => ln.setAttribute("lnType", idNew));
      }
      return {
        new: {
          parent: doc.querySelector(":root > DataTypeTemplates"),
          element: lNodeType,
          reference: doc.querySelector(":root > DataTypeTemplates > DOType")
        }
      };
    }
    addDOType(doType, doc) {
      const existDOType = doc.querySelector(`:root > DataTypeTemplates > DOType[id="${doType.getAttribute("id")}"]`);
      if (existDOType && doType.isEqualNode(existDOType))
        return;
      if (existDOType) {
        const ied = doType.parentElement.parentElement.querySelector(":root > IED");
        const data = doType.parentElement;
        const idOld = doType.getAttribute("id");
        const idNew = ied.getAttribute("name") + idOld;
        doType.setAttribute("id", idNew);
        data.querySelectorAll(`LNodeType > DO[type="${idOld}"], DOType > SDO[type="${idOld}"]`).forEach((type) => type.setAttribute("type", idNew));
      }
      return {
        new: {
          parent: doc.querySelector(":root > DataTypeTemplates"),
          element: doType,
          reference: doc.querySelector(":root > DataTypeTemplates > DAType")
        }
      };
    }
    addDAType(daType, doc) {
      const existDAType = doc.querySelector(`:root > DataTypeTemplates > DAType[id="${daType.getAttribute("id")}"]`);
      if (existDAType && daType.isEqualNode(existDAType))
        return;
      if (existDAType) {
        const ied = daType.parentElement.parentElement.querySelector(":root > IED");
        const data = daType.parentElement;
        const idOld = daType.getAttribute("id");
        const idNew = ied.getAttribute("name") + idOld;
        daType.setAttribute("id", idNew);
        data.querySelectorAll(`DOType > DA[type="${idOld}"],DAType > BDA[type="${idOld}"]`).forEach((type) => type.setAttribute("type", idNew));
      }
      return {
        new: {
          parent: doc.querySelector(":root > DataTypeTemplates"),
          element: daType,
          reference: doc.querySelector(":root > DataTypeTemplates > EnumType")
        }
      };
    }
    addEnumType(enumType, doc) {
      const existEnumType = doc.querySelector(`:root > DataTypeTemplates > EnumType[id="${enumType.getAttribute("id")}"]`);
      if (existEnumType && enumType.isEqualNode(existEnumType))
        return;
      if (existEnumType) {
        const ied = enumType.parentElement.parentElement.querySelector(":root > IED");
        const data = enumType.parentElement;
        const idOld = enumType.getAttribute("id");
        const idNew = ied.getAttribute("name") + idOld;
        enumType.setAttribute("id", idNew);
        data.querySelectorAll(`DOType > DA[type="${idOld}"],DAType > BDA[type="${idOld}"]`).forEach((type) => type.setAttribute("type", idNew));
      }
      return {
        new: {
          parent: doc.querySelector(":root > DataTypeTemplates"),
          element: enumType,
          reference: null
        }
      };
    }
    addIED(ied, templates, doc) {
      const actions = [];
      templates.querySelectorAll(":root > DataTypeTemplates > LNodeType").forEach((lNodeType) => actions.push(this.addLNodeType(lNodeType, doc)));
      templates.querySelectorAll(":root > DataTypeTemplates > DOType").forEach((doType) => actions.push(this.addDOType(doType, doc)));
      templates.querySelectorAll(":root > DataTypeTemplates > DAType").forEach((daType) => actions.push(this.addDAType(daType, doc)));
      templates.querySelectorAll(":root > DataTypeTemplates > EnumType").forEach((enumType) => actions.push(this.addEnumType(enumType, doc)));
      actions.push({
        new: {
          parent: doc.querySelector(":root"),
          element: ied,
          reference: doc.querySelector(":root > DataTypeTemplates")
        }
      });
      this.dispatchEvent(newActionEvent({
        title: "Import IED " + ied.getAttribute("name"),
        actions: actions.filter((action) => action !== void 0)
      }));
    }
    isValidIED(ied, doc) {
      if (!ied) {
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("import.log.missingied")
        }));
        return false;
      }
      if (Array.from(doc.querySelectorAll(":root > IED")).map((ied2) => ied2.getAttribute("name")).filter((iedName) => iedName === ied.getAttribute("name")).length) {
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("import.log.nouniqueied", {
            name: ied.getAttribute("name")
          })
        }));
        return false;
      }
      return true;
    }
    async importIED(src, doc) {
      let iedDoc = null;
      const response = await fetch(src);
      const text = await response.text();
      iedDoc = new DOMParser().parseFromString(text, "application/xml");
      if (!iedDoc || iedDoc.querySelector("parsererror")) {
        this.dispatchEvent(newLogEvent({
          kind: "error",
          title: get("import.log.parsererror")
        }));
        throw new Error(get("import.log.loaderror"));
      }
      if (!doc.querySelector(":root > DataTypeTemplates")) {
        const element = createElement(doc, "DataTypeTemplates", {});
        this.dispatchEvent(newActionEvent({
          new: {
            parent: doc.documentElement,
            element,
            reference: null
          }
        }));
      }
      const msg = "IED " + iedDoc.querySelector(":root > IED")?.getAttribute("name") + " loaded";
      const isSuccessful = this.isValidIED(iedDoc.querySelector(":root > IED"), doc);
      if (isSuccessful) {
        this.addIED(iedDoc.querySelector(":root > IED"), iedDoc.querySelector(":root > DataTypeTemplates"), doc);
      }
      if (src.startsWith("blob:"))
        URL.revokeObjectURL(src);
      if (isSuccessful)
        return msg;
      throw new Error(get("import.log.importerror"));
    }
  }
  return ImportingElement;
}
