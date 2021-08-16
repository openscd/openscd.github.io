import {
  cloneElement,
  getValue
} from "../../foundation.js";
export function updateNamingAction(element) {
  return (inputs) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    if (name === element.getAttribute("name") && desc === element.getAttribute("desc"))
      return [];
    const newElement = cloneElement(element, {name, desc});
    return [{old: {element}, new: {element: newElement}}];
  };
}
