export function getFcdaTitleValue(fcdaElement) {
  return `${fcdaElement.getAttribute("doName")}${fcdaElement.hasAttribute("doName") && fcdaElement.hasAttribute("daName") ? `.` : ``}${fcdaElement.getAttribute("daName")}`;
}
export function newFcdaSelectEvent(svc, fcda, eventInitDict) {
  return new CustomEvent("fcda-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {svc, fcda, ...eventInitDict?.detail}
  });
}
