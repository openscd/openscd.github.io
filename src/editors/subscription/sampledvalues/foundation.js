export function newSmvSelectEvent(smvControl, dataset, eventInitDict) {
  return new CustomEvent("smv-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {smvControl, dataset, ...eventInitDict?.detail}
  });
}
export function newSmvSubscriptionEvent(ied, subscribeStatus) {
  return new CustomEvent("smv-subscription", {
    bubbles: true,
    composed: true,
    detail: {ied, subscribeStatus}
  });
}
