export function getFcdaTitleValue(fcdaElement) {
  return `${fcdaElement.getAttribute("doName")}${fcdaElement.hasAttribute("doName") && fcdaElement.hasAttribute("daName") ? `.` : ``}${fcdaElement.getAttribute("daName")}`;
}
export function newFcdaSelectEvent(controlElement, fcda, eventInitDict) {
  return new CustomEvent("fcda-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {controlElement, fcda, ...eventInitDict?.detail}
  });
}
