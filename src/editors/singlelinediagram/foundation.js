const COORDINATES_SCALE_FACTOR = 2;
export function getNameAttribute(element) {
  const name = element.getAttribute("name");
  return name ? name : void 0;
}
export function getDescriptionAttribute(element) {
  const name = element.getAttribute("desc");
  return name ? name : void 0;
}
export function getPathNameAttribute(element) {
  const name = element.getAttribute("pathName");
  return name ? name : void 0;
}
export function getRelativeCoordinates(element) {
  const x = element.getAttributeNS("http://www.iec.ch/61850/2003/SCLcoordinates", "x");
  const y = element.getAttributeNS("http://www.iec.ch/61850/2003/SCLcoordinates", "y");
  return {
    x: x ? parseInt(x) * COORDINATES_SCALE_FACTOR : 0,
    y: y ? parseInt(y) * COORDINATES_SCALE_FACTOR : 0
  };
}
export function getAbsoluteCoordinates(element) {
  if (!element.parentElement || element.parentElement?.tagName === "SCL")
    return getRelativeCoordinates(element);
  const absParent = getAbsoluteCoordinates(element.parentElement);
  const relElement = getRelativeCoordinates(element);
  return {
    x: absParent.x + relElement.x,
    y: absParent.y + relElement.y
  };
}
export function isBusBar(element) {
  return element.children.length === 1 && element.children[0].tagName === "ConnectivityNode";
}
export function getConnectedTerminals(element) {
  const substationElement = element?.closest("Substation");
  if (!substationElement)
    return [];
  const path = getPathNameAttribute(element) ?? "";
  const [substationName, voltageLevelName, bayName] = path.split("/");
  return Array.from(substationElement.getElementsByTagName("Terminal")).filter((terminal) => terminal.getAttribute("connectivityNode") === path && terminal.getAttribute("substationName") === substationName && terminal.getAttribute("voltageLevelName") === voltageLevelName && terminal.getAttribute("bayName") === bayName && terminal.getAttribute("cNodeName") === getNameAttribute(element));
}
export function calculateConnectivityNodeCoordinates(cNodeElement) {
  if (cNodeElement.tagName != "ConnectivityNode")
    return {x: 0, y: 0};
  const substationElement = cNodeElement.closest("Substation");
  const pathName = getPathNameAttribute(cNodeElement);
  let nrOfConnections = 0;
  let totalX = 0;
  let totalY = 0;
  Array.from(substationElement.querySelectorAll("ConductingEquipment, PowerTransformer")).filter((equipment) => equipment.querySelector(`Terminal[connectivityNode="${pathName}"]`) != null).forEach((equipment) => {
    nrOfConnections++;
    const {x, y} = getAbsoluteCoordinates(equipment);
    totalX += x;
    totalY += y;
  });
  if (nrOfConnections === 0)
    return {x: 0, y: 0};
  if (nrOfConnections === 1)
    return {x: totalX + 1, y: totalY + 1};
  return {
    x: Math.round(totalX / nrOfConnections),
    y: Math.round(totalY / nrOfConnections)
  };
}
