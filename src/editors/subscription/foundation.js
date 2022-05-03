import {css} from "../../../_snowpack/pkg/lit-element.js";
export var SubscribeStatus;
(function(SubscribeStatus2) {
  SubscribeStatus2[SubscribeStatus2["Full"] = 0] = "Full";
  SubscribeStatus2[SubscribeStatus2["Partial"] = 1] = "Partial";
  SubscribeStatus2[SubscribeStatus2["None"] = 2] = "None";
})(SubscribeStatus || (SubscribeStatus = {}));
export var View;
(function(View2) {
  View2[View2["GOOSE_PUBLISHER"] = 0] = "GOOSE_PUBLISHER";
  View2[View2["GOOSE_SUBSCRIBER"] = 1] = "GOOSE_SUBSCRIBER";
})(View || (View = {}));
export function newGOOSESelectEvent(gseControl, dataset, eventInitDict) {
  return new CustomEvent("goose-dataset", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {gseControl, dataset, ...eventInitDict?.detail}
  });
}
export function newIEDSelectEvent(ied, eventInitDict) {
  return new CustomEvent("ied-select", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {ied, ...eventInitDict?.detail}
  });
}
export function newViewEvent(view, eventInitDict) {
  return new CustomEvent("view", {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {view, ...eventInitDict?.detail}
  });
}
export function newSubscriptionEvent(element, subscribeStatus) {
  return new CustomEvent("subscription", {
    bubbles: true,
    composed: true,
    detail: {element, subscribeStatus}
  });
}
export const styles = css`
  :host(.moving) section {
    opacity: 0.3;
  }

  section {
    background-color: var(--mdc-theme-surface);
    transition: all 200ms linear;
    outline-color: var(--mdc-theme-primary);
    outline-style: solid;
    outline-width: 0px;
    opacity: 1;
  }

  section:focus {
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
  }

  section:focus-within {
    outline-width: 2px;
    transition: all 250ms linear;
  }

  h1,
  h2,
  h3 {
    color: var(--mdc-theme-on-surface);
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 0px;
    line-height: 48px;
    padding-left: 0.3em;
    transition: background-color 150ms linear;
  }

  section:focus-within > h1,
  section:focus-within > h2,
  section:focus-within > h3 {
    color: var(--mdc-theme-surface);
    background-color: var(--mdc-theme-primary);
    transition: background-color 200ms linear;
  }

  h1 > nav,
  h2 > nav,
  h3 > nav,
  h1 > abbr > mwc-icon-button,
  h2 > abbr > mwc-icon-button,
  h3 > abbr > mwc-icon-button {
    float: right;
  }

  abbr[title] {
    border-bottom: none !important;
    cursor: inherit !important;
    text-decoration: none !important;
  }

  mwc-list-item[noninteractive] {
    font-weight: 500;
  }
`;
