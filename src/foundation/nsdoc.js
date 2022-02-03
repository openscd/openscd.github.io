import {iec6185074} from "../validators/templates/foundation.js";
export async function initializeNsdoc() {
  const nsdoc72 = localStorage.getItem("IEC 61850-7-2") ? new DOMParser().parseFromString(localStorage.getItem("IEC 61850-7-2"), "application/xml") : void 0;
  const nsdoc73 = localStorage.getItem("IEC 61850-7-3") ? new DOMParser().parseFromString(localStorage.getItem("IEC 61850-7-3"), "application/xml") : void 0;
  const nsdoc74 = localStorage.getItem("IEC 61850-7-4") ? new DOMParser().parseFromString(localStorage.getItem("IEC 61850-7-4"), "application/xml") : void 0;
  const nsdoc81 = localStorage.getItem("IEC 61850-8-1") ? new DOMParser().parseFromString(localStorage.getItem("IEC 61850-8-1"), "application/xml") : void 0;
  const nsd74 = await iec6185074;
  const iedElementTagNames = ["LN", "LN0"];
  const getDataDescriptions = {
    LN: {
      getDataDescription: getLNDataDescription
    },
    LN0: {
      getDataDescription: getLNDataDescription
    }
  };
  function getLNDataDescription(lnElement) {
    const lnClassAttribute = lnElement.getAttribute("lnClass");
    const lnClass = nsd74.querySelector(`NS > LNClasses > LNClass[name="${lnClassAttribute}"]`);
    const titleId = lnClass?.getAttribute("titleID");
    return {
      label: getNsdocDocumentation(nsdoc74, titleId) ?? lnClassAttribute
    };
  }
  return {
    nsdoc72,
    nsdoc73,
    nsdoc74,
    nsdoc81,
    getDataDescription: function getDataDescription(element) {
      return getDataDescriptions[element.tagName].getDataDescription(element);
    }
  };
}
function getNsdocDocumentation(nsdoc, id) {
  return nsdoc?.querySelector(`NSDoc > Doc[id="${id}"]`)?.textContent;
}
