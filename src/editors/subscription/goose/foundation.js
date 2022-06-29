export function newGOOSESelectEvent(gseControl, dataset, eventInitDict) {
  return new CustomEvent("goose-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {gseControl, dataset, ...eventInitDict?.detail}
  });
}
export function newGooseSubscriptionEvent(ied, subscribeStatus) {
  return new CustomEvent("goose-subscription", {
    bubbles: true,
    composed: true,
    detail: {ied, subscribeStatus}
  });
}
