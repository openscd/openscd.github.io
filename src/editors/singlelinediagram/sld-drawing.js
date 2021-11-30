import {
  OrthogonalConnector
} from "../../../public/js/ortho-connector.js";
import {identity} from "../../foundation.js";
import {getIcon} from "../../zeroline/foundation.js";
import {
  connectivityNodeIcon,
  powerTransformerTwoWindingIcon
} from "../../icons.js";
import {
  getRelativeCoordinates,
  getDescriptionAttribute,
  getNameAttribute,
  getAbsoluteCoordinates,
  calculateConnectivityNodeCoordinates
} from "./foundation.js";
export const SVG_GRID_SIZE = 64;
export const DEFAULT_ELEMENT_SIZE = 25;
const TERMINAL_OFFSET = 6;
export function getAbsolutePosition(element) {
  const absoluteCoordinates = getAbsoluteCoordinates(element);
  return {
    x: absoluteCoordinates.x * SVG_GRID_SIZE,
    y: absoluteCoordinates.y * SVG_GRID_SIZE
  };
}
export function getAbsolutePositionConnectivityNode(connectivityNode) {
  const absoluteCoordinates = calculateConnectivityNodeCoordinates(connectivityNode);
  return {
    x: absoluteCoordinates.x * SVG_GRID_SIZE,
    y: absoluteCoordinates.y * SVG_GRID_SIZE
  };
}
export function getParentElementName(childElement) {
  const parentElement = childElement.parentElement;
  return getNameAttribute(parentElement);
}
function createGroupElement(element) {
  const finalElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  finalElement.setAttribute("id", typeof identity(element) === "string" ? identity(element) : "unidentifiable");
  finalElement.setAttribute("type", element.tagName);
  const description = getDescriptionAttribute(element);
  if (description)
    finalElement.setAttribute("desc", description);
  const coordinates = getRelativeCoordinates(element);
  finalElement.setAttribute("sxy:x", `${coordinates.x}`);
  finalElement.setAttribute("sxy:y", `${coordinates.y}`);
  return finalElement;
}
export function createVoltageLevelElement(voltageLevel) {
  return createGroupElement(voltageLevel);
}
export function createBayElement(bay) {
  return createGroupElement(bay);
}
export function createTextElement(textContent, coordinates, textSize) {
  const finalElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  finalElement.textContent = textContent;
  finalElement.setAttribute("style", `font-family: Roboto, sans-serif; font-weight: 300; font-size: ${textSize}`);
  finalElement.setAttribute("x", `${coordinates.x}`);
  finalElement.setAttribute("y", `${coordinates.y}`);
  return finalElement;
}
export function createTerminalElement(elementPosition, sideToDraw, terminalElement, clickAction) {
  const groupElement = createGroupElement(terminalElement);
  const terminalIdentity = typeof identity(terminalElement) === "string" ? identity(terminalElement) : "unidentifiable";
  const pointToDrawTerminalOn = getAbsolutePositionTerminal(elementPosition, sideToDraw);
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  icon.setAttribute("id", `${terminalIdentity}`);
  icon.setAttribute("cx", `${pointToDrawTerminalOn.x}`);
  icon.setAttribute("cy", `${pointToDrawTerminalOn.y}`);
  icon.setAttribute("r", "2");
  groupElement.appendChild(icon);
  groupElement.addEventListener("click", clickAction);
  return groupElement;
}
export function createBusBarElement(busBarElement, biggestVoltageLevelXCoordinate) {
  const groupElement = createGroupElement(busBarElement);
  const busBarName = getNameAttribute(busBarElement);
  const absolutePosition = getAbsolutePosition(busBarElement);
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "line");
  icon.setAttribute("name", getNameAttribute(busBarElement));
  icon.setAttribute("stroke-width", "4");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("x1", `${absolutePosition.x}`);
  icon.setAttribute("y1", `${absolutePosition.y}`);
  icon.setAttribute("x2", `${biggestVoltageLevelXCoordinate}`);
  icon.setAttribute("y2", `${absolutePosition.y}`);
  groupElement.appendChild(icon);
  const text = createTextElement(busBarName, {x: absolutePosition.x, y: absolutePosition.y - 10}, "small");
  groupElement.appendChild(text);
  return groupElement;
}
export function createConductingEquipmentElement(equipmentElement) {
  const groupElement = createGroupElement(equipmentElement);
  const absolutePosition = getAbsolutePosition(equipmentElement);
  const parsedIcon = new DOMParser().parseFromString(getIcon(equipmentElement).strings[0], "application/xml");
  parsedIcon.querySelectorAll("circle,path,line").forEach((icon) => {
    icon.setAttribute("transform", `translate(${absolutePosition.x},${absolutePosition.y})`);
    groupElement.appendChild(icon);
  });
  const text = createTextElement(getNameAttribute(equipmentElement), {x: absolutePosition.x - 15, y: absolutePosition.y + 30}, "x-small");
  groupElement.appendChild(text);
  return groupElement;
}
export function createPowerTransformerElement(powerTransformerElement) {
  const groupElement = createGroupElement(powerTransformerElement);
  const absolutePosition = getAbsolutePosition(powerTransformerElement);
  const parsedIcon = new DOMParser().parseFromString(powerTransformerTwoWindingIcon.strings[0], "application/xml");
  parsedIcon.querySelectorAll("circle,path,line").forEach((icon) => {
    icon.setAttribute("transform", `translate(${absolutePosition.x},${absolutePosition.y}) scale(1.5)`);
    groupElement.appendChild(icon);
  });
  const text = createTextElement(getNameAttribute(powerTransformerElement), {x: absolutePosition.x - 15, y: absolutePosition.y + 30}, "x-small");
  groupElement.appendChild(text);
  return groupElement;
}
export function createConnectivityNodeElement(cNodeElement, position, clickAction) {
  const groupElement = createGroupElement(cNodeElement);
  const parsedIcon = new DOMParser().parseFromString(connectivityNodeIcon.strings[0], "application/xml");
  parsedIcon.querySelectorAll("circle").forEach((icon) => {
    icon.setAttribute("transform", `translate(${position.x},${position.y})`);
    groupElement.appendChild(icon);
  });
  groupElement.addEventListener("click", clickAction);
  return groupElement;
}
export function drawRouteBetweenElements(pointA, pointB, pointAShape, pointBShape, svgToDrawOn) {
  const positionMiddleOfA = convertRoutePointToMiddleOfElement(pointA, pointAShape);
  const positionMiddleOfB = convertRoutePointToMiddleOfElement(pointB, pointBShape);
  const shapeA = {
    left: positionMiddleOfA.x,
    top: positionMiddleOfA.y,
    width: pointAShape?.width,
    height: pointAShape?.height
  };
  const shapeB = {
    left: positionMiddleOfB.x,
    top: positionMiddleOfB.y,
    width: pointBShape?.width,
    height: pointBShape?.height
  };
  const sides = getDirections(pointA, pointB);
  const path = OrthogonalConnector.route({
    pointA: {shape: shapeA, side: sides.pointASide, distance: 0.5},
    pointB: {shape: shapeB, side: sides.pointBSide, distance: 0.5},
    shapeMargin: 0,
    globalBoundsMargin: 0,
    globalBounds: {
      left: 0,
      top: 0,
      width: 1e4,
      height: 1e4
    }
  });
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let d = "";
  path.forEach(({x, y}, index) => {
    if (index === 0) {
      d = d + ` M ${x} ${y}`;
    } else {
      d = d + ` L ${x} ${y}`;
    }
  });
  line.setAttribute("d", d);
  line.setAttribute("fill", "transparent");
  line.setAttribute("stroke", "currentColor");
  line.setAttribute("stroke-width", "1.5");
  svgToDrawOn.insertAdjacentElement("afterbegin", line);
  return sides;
}
export function getElementDimensions(bayName, elementName, svg) {
  let {height, width} = {height: 0, width: 0};
  svg.querySelectorAll(`g[id="${bayName}"] > g[id="${elementName}"]`).forEach((b) => {
    height = b.getBoundingClientRect().height;
    width = b.getBoundingClientRect().width;
  });
  return {height, width};
}
function getDirections(pointA, pointB) {
  if (pointA.x == pointB.x) {
    if (pointA.y < pointB.y) {
      return {pointASide: "bottom", pointBSide: "top"};
    } else {
      return {pointASide: "top", pointBSide: "bottom"};
    }
  } else {
    if (pointA.y <= pointB.y) {
      if (pointA.x < pointB.x) {
        return {pointASide: "right", pointBSide: "left"};
      } else {
        return {pointASide: "left", pointBSide: "right"};
      }
    } else {
      if (pointA.x < pointB.x) {
        return {pointASide: "left", pointBSide: "right"};
      } else {
        return {pointASide: "right", pointBSide: "left"};
      }
    }
  }
}
function getAbsolutePositionTerminal(terminalParentPosition, side) {
  switch (side) {
    case "top": {
      const x = terminalParentPosition.x;
      const y = terminalParentPosition.y;
      return {
        x: x + DEFAULT_ELEMENT_SIZE / 2,
        y: y - TERMINAL_OFFSET
      };
    }
    case "bottom": {
      const x = terminalParentPosition.x;
      const y = terminalParentPosition.y;
      return {
        x: x + DEFAULT_ELEMENT_SIZE / 2,
        y: y + (DEFAULT_ELEMENT_SIZE + TERMINAL_OFFSET)
      };
    }
    case "left": {
      const x = terminalParentPosition.x;
      const y = terminalParentPosition.y;
      return {
        x: x - TERMINAL_OFFSET,
        y: y + DEFAULT_ELEMENT_SIZE / 2
      };
    }
    case "right": {
      const x = terminalParentPosition.x;
      const y = terminalParentPosition.y;
      return {
        x: x + (DEFAULT_ELEMENT_SIZE + TERMINAL_OFFSET),
        y: y + DEFAULT_ELEMENT_SIZE / 2
      };
    }
    default: {
      return terminalParentPosition;
    }
  }
}
function convertRoutePointToMiddleOfElement(point, shape) {
  return {
    x: point.x + (DEFAULT_ELEMENT_SIZE - shape.width) / 2,
    y: point.y + (DEFAULT_ELEMENT_SIZE - shape.height) / 2
  };
}
export function getBusBarLength(root) {
  return Math.max(...Array.from(root.querySelectorAll("ConductingEquipment, PowerTransformer")).map((equipment) => getAbsolutePosition(equipment).x)) + SVG_GRID_SIZE;
}
