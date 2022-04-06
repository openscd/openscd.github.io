"use strict";
import {identity} from "../../foundation.js";
export function cleanSCLItems(cleanItems) {
  const actions = [];
  if (cleanItems) {
    cleanItems.forEach((item) => {
      actions.push({
        old: {
          parent: item.parentElement,
          element: item,
          reference: item.nextSibling
        }
      });
    });
  }
  return actions;
}
export function identitySort(elements) {
  return elements.sort((a, b) => {
    const aId = identity(a);
    const bId = identity(b);
    if (aId < bId) {
      return -1;
    }
    if (aId > bId) {
      return 1;
    }
    return 0;
  });
}
