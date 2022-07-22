import {html} from "../../_snowpack/pkg/lit-element.js";
import {repeat} from "../../_snowpack/pkg/lit-html/directives/repeat.js";
import {get, translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-list.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../_snowpack/pkg/@material/mwc-icon.js";
import {identity} from "../foundation.js";
import {nothing} from "../../_snowpack/pkg/lit-html.js";
function describe(element) {
  const id = identity(element);
  return typeof id === "string" ? id : get("unidentifiable");
}
export function diffSclAttributes(elementToBeCompared, elementToCompareAgainst) {
  const attrDiffs = [];
  const newText = elementToBeCompared.textContent?.trim() ?? "";
  const oldText = elementToCompareAgainst.textContent?.trim() ?? "";
  if (elementToBeCompared.childElementCount === 0 && elementToCompareAgainst.childElementCount === 0 && newText !== oldText) {
    attrDiffs.push(["value", {newValue: newText, oldValue: oldText}]);
  }
  const attributeNames = new Set(elementToCompareAgainst.getAttributeNames().concat(elementToBeCompared.getAttributeNames()));
  for (const name of attributeNames) {
    if (elementToCompareAgainst.getAttribute(name) !== elementToBeCompared.getAttribute(name)) {
      attrDiffs.push([
        name,
        {
          newValue: elementToBeCompared.getAttribute(name),
          oldValue: elementToCompareAgainst.getAttribute(name)
        }
      ]);
    }
  }
  return attrDiffs;
}
export function identityForCompare(element) {
  let identityOfElement = identity(element);
  if (typeof identityOfElement === "string") {
    identityOfElement = identityOfElement.split(">").pop() ?? "";
  }
  return identityOfElement;
}
export function isSame(newValue, oldValue) {
  return newValue.tagName === oldValue.tagName && identityForCompare(newValue) === identityForCompare(oldValue);
}
export function diffSclChilds(elementToBeCompared, elementToCompareAgainst) {
  const childDiffs = [];
  const childrenToBeCompared = Array.from(elementToBeCompared.children);
  const childrenToCompareTo = Array.from(elementToCompareAgainst.children);
  childrenToBeCompared.forEach((newElement) => {
    if (!newElement.closest("Private")) {
      const twinIndex = childrenToCompareTo.findIndex((ourChild) => isSame(newElement, ourChild));
      const oldElement = twinIndex > -1 ? childrenToCompareTo[twinIndex] : null;
      if (oldElement) {
        childrenToCompareTo.splice(twinIndex, 1);
        childDiffs.push({newValue: newElement, oldValue: oldElement});
      } else {
        childDiffs.push({newValue: newElement, oldValue: null});
      }
    }
  });
  childrenToCompareTo.forEach((oldElement) => {
    if (!oldElement.closest("Private")) {
      childDiffs.push({newValue: null, oldValue: oldElement});
    }
  });
  return childDiffs;
}
export function renderDiff(elementToBeCompared, elementToCompareAgainst) {
  let idTitle = identity(elementToBeCompared).toString();
  if (idTitle === "NaN") {
    idTitle = void 0;
  }
  const attrDiffs = diffSclAttributes(elementToBeCompared, elementToCompareAgainst);
  const childDiffs = diffSclChilds(elementToBeCompared, elementToCompareAgainst);
  const childAddedOrDeleted = [];
  const childToCompare = [];
  childDiffs.forEach((diff) => {
    if (!diff.oldValue || !diff.newValue) {
      childAddedOrDeleted.push(diff);
    } else {
      childToCompare.push(diff);
    }
  });
  const childToCompareTemplates = childToCompare.map((diff) => renderDiff(diff.newValue, diff.oldValue)).filter((result) => result !== null);
  if (childToCompareTemplates.length > 0 || attrDiffs.length > 0 || childAddedOrDeleted.length > 0) {
    return html` ${attrDiffs.length > 0 || childAddedOrDeleted.length > 0 ? html` <mwc-list multi>
          ${attrDiffs.length > 0 ? html` <mwc-list-item noninteractive ?twoline=${!!idTitle}>
                  <span class="resultTitle">
                    ${translate("compare.attributes", {
      elementName: elementToBeCompared.tagName
    })}
                  </span>
                  ${idTitle ? html`<span slot="secondary">${idTitle}</span>` : nothing}
                </mwc-list-item>
                <li padded divider role="separator"></li>` : ""}
          ${repeat(attrDiffs, (e) => e, ([name, diff]) => html` <mwc-list-item twoline left hasMeta>
                <span>${name}</span>
                <span slot="secondary">
                  ${diff.oldValue ?? ""}
                  ${diff.oldValue && diff.newValue ? html`&curarr;` : " "}
                  ${diff.newValue ?? ""}
                </span>
                <mwc-icon slot="meta">
                  ${diff.oldValue ? diff.newValue ? "edit" : "delete" : "add"}
                </mwc-icon>
              </mwc-list-item>`)}
          ${childAddedOrDeleted.length > 0 ? html` <mwc-list-item noninteractive ?twoline=${!!idTitle}>
                  <span class="resultTitle">
                    ${translate("compare.children", {
      elementName: elementToBeCompared.tagName
    })}
                  </span>
                  ${idTitle ? html`<span slot="secondary">${idTitle}</span>` : nothing}
                </mwc-list-item>
                <li padded divider role="separator"></li>` : ""}
          ${repeat(childAddedOrDeleted, (e) => e, (diff) => html` <mwc-list-item twoline left hasMeta>
                <span>${diff.oldValue?.tagName ?? diff.newValue?.tagName}</span>
                <span slot="secondary">
                  ${diff.oldValue ? describe(diff.oldValue) : describe(diff.newValue)}
                </span>
                <mwc-icon slot="meta">
                  ${diff.oldValue ? "delete" : "add"}
                </mwc-icon>
              </mwc-list-item>`)}
        </mwc-list>` : ""}
    ${childToCompareTemplates}`;
  }
  return null;
}
