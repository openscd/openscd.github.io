var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {
  css,
  html,
  LitElement,
  property,
  query
} from "../../_snowpack/pkg/lit-element.js";
import {identity, newWizardEvent} from "../foundation.js";
import panzoom from "../../_snowpack/pkg/panzoom.js";
import {
  getAbsolutePosition,
  drawRouteBetweenElements,
  DEFAULT_ELEMENT_SIZE,
  createTerminalElement,
  createBusBarElement,
  createVoltageLevelElement,
  createBayElement,
  createConductingEquipmentElement,
  createConnectivityNodeElement,
  getElementDimensions,
  getAbsolutePositionConnectivityNode,
  getBusBarLength,
  createPowerTransformerElement
} from "./singlelinediagram/sld-drawing.js";
import {
  isBusBar,
  getConnectedTerminals,
  getPathNameAttribute,
  getNameAttribute
} from "./singlelinediagram/foundation.js";
import {wizards} from "../wizards/wizard-library.js";
export default class SingleLineDiagramPlugin extends LitElement {
  get busBars() {
    return Array.from(this.doc.querySelectorAll("Bay")).filter((bay) => isBusBar(bay));
  }
  get bays() {
    return Array.from(this.doc.querySelectorAll("Bay")).filter((bay) => !isBusBar(bay));
  }
  get voltageLevels() {
    return Array.from(this.doc.querySelectorAll("VoltageLevel"));
  }
  drawVoltageLevels() {
    this.voltageLevels.forEach((voltageLevel) => {
      const voltageLevelElement = createVoltageLevelElement(voltageLevel);
      this.svg.appendChild(voltageLevelElement);
    });
  }
  drawBays() {
    this.bays.forEach((bay) => {
      const bayElement = createBayElement(bay);
      this.addElementToGroup(bayElement, identity(bay.parentElement));
    });
  }
  drawPowerTransformers() {
    Array.from(this.doc.querySelectorAll("PowerTransformer")).forEach((powerTransformer) => {
      const powerTransformerElement = createPowerTransformerElement(powerTransformer);
      if (powerTransformer.parentElement?.tagName === "Substation")
        this.svg.appendChild(powerTransformerElement);
      else
        this.addElementToGroup(powerTransformerElement, identity(powerTransformer.parentElement));
    });
  }
  drawConductingEquipments() {
    Array.from(this.doc.querySelectorAll("ConductingEquipment")).filter((child) => Array.from(child.querySelectorAll("Terminal")).filter((terminal) => terminal.getAttribute("cNodeName") !== "grounded").length !== 0).forEach((equipment) => {
      const eqElement = createConductingEquipmentElement(equipment);
      this.addElementToGroup(eqElement, identity(equipment.parentElement));
    });
  }
  drawConnectivityNodes() {
    this.bays.forEach((bay) => {
      Array.from(bay.querySelectorAll("ConnectivityNode")).filter((cNode) => cNode.getAttribute("name") !== "grounded").filter((cNode) => getConnectedTerminals(cNode).length > 0).forEach((cNode) => {
        const cNodePosition = getAbsolutePositionConnectivityNode(cNode);
        const cNodeElement = createConnectivityNodeElement(cNode, cNodePosition, () => this.openEditWizard(cNode));
        this.addElementToGroup(cNodeElement, identity(cNode.parentElement));
      });
    });
  }
  drawBusBars() {
    this.busBars.forEach((busBar) => {
      const busBarElement = createBusBarElement(busBar, getBusBarLength(busBar.parentElement ?? this.doc));
      this.addElementToGroup(busBarElement, identity(busBar.parentElement));
    });
  }
  drawConnectivityNodeConnections() {
    this.bays.forEach((bay) => {
      Array.from(bay.querySelectorAll("ConnectivityNode")).filter((cNode) => cNode.getAttribute("name") !== "grounded").forEach((cNode) => {
        const cNodeAbsolutePosition = getAbsolutePositionConnectivityNode(cNode);
        const cNodeDimensions = getElementDimensions(getNameAttribute(bay), getNameAttribute(cNode), this.svg);
        Array.from(this.doc.querySelectorAll("ConductingEquipment,PowerTransformer")).filter((cEquipment) => cEquipment.querySelector(`Terminal[connectivityNode="${cNode.getAttribute("pathName")}"]`)).forEach((cEquipment) => {
          const cEquipmentAbsolutePosition = getAbsolutePosition(cEquipment);
          let sideToDrawTerminalOn;
          if (cEquipmentAbsolutePosition.y > cNodeAbsolutePosition.y) {
            const sidesOfRoutes = drawRouteBetweenElements(cNodeAbsolutePosition, cEquipmentAbsolutePosition, cNodeDimensions, {
              height: DEFAULT_ELEMENT_SIZE,
              width: DEFAULT_ELEMENT_SIZE
            }, this.svg);
            sideToDrawTerminalOn = sidesOfRoutes.pointBSide;
          } else {
            const sidesOfRoutes = drawRouteBetweenElements(cEquipmentAbsolutePosition, cNodeAbsolutePosition, {
              height: DEFAULT_ELEMENT_SIZE,
              width: DEFAULT_ELEMENT_SIZE
            }, cNodeDimensions, this.svg);
            sideToDrawTerminalOn = sidesOfRoutes.pointASide;
          }
          const terminalElement = cEquipment.querySelector(`Terminal[connectivityNode="${cNode.getAttribute("pathName")}"]`);
          const terminal = createTerminalElement(cEquipmentAbsolutePosition, sideToDrawTerminalOn, terminalElement, () => this.openEditWizard(terminalElement));
          this.svg.querySelectorAll(`g[id="${identity(cEquipment)}"]`).forEach((eq) => eq.appendChild(terminal));
        });
      });
    });
  }
  drawBusBarConnections() {
    this.busBars.forEach((busBar) => {
      const pathName = getPathNameAttribute(busBar.children[0]);
      const busBarPosition = getAbsolutePosition(busBar);
      Array.from(this.doc.querySelectorAll("ConductingEquipment")).filter((cEquipment) => cEquipment.querySelector(`Terminal[connectivityNode="${pathName}"]`)).forEach((cEquipment) => {
        const cEquipmentAbsolutePosition = getAbsolutePosition(cEquipment);
        let sideToDrawTerminalOn;
        const customShape = {width: DEFAULT_ELEMENT_SIZE, height: 1};
        if (busBarPosition.y > cEquipmentAbsolutePosition.y) {
          const sidesOfRoutes = drawRouteBetweenElements(cEquipmentAbsolutePosition, {
            x: cEquipmentAbsolutePosition.x,
            y: busBarPosition.y - (DEFAULT_ELEMENT_SIZE - customShape.height) / 2
          }, customShape, customShape, this.svg);
          sideToDrawTerminalOn = sidesOfRoutes.pointASide;
        } else {
          const sidesOfRoutes = drawRouteBetweenElements({
            x: cEquipmentAbsolutePosition.x,
            y: busBarPosition.y - (DEFAULT_ELEMENT_SIZE - customShape.height) / 2
          }, cEquipmentAbsolutePosition, customShape, customShape, this.svg);
          sideToDrawTerminalOn = sidesOfRoutes.pointBSide;
        }
        const terminalElement = cEquipment.querySelector(`Terminal[connectivityNode="${pathName}"]`);
        const terminal = createTerminalElement(cEquipmentAbsolutePosition, sideToDrawTerminalOn, terminalElement, () => this.openEditWizard(terminalElement));
        this.svg.querySelectorAll(`g[id="${identity(cEquipment)}"]`).forEach((eq) => eq.appendChild(terminal));
      });
    });
  }
  drawSubstationElements() {
    this.drawVoltageLevels();
    this.drawBays();
    this.drawConductingEquipments();
    this.drawPowerTransformers();
    this.drawConnectivityNodes();
    this.drawBusBars();
    this.drawConnectivityNodeConnections();
    this.drawBusBarConnections();
  }
  addElementToGroup(elementToAdd, identity2) {
    this.svg.querySelectorAll(`g[id="${identity2}"]`).forEach((group) => group.appendChild(elementToAdd));
  }
  openEditWizard(element) {
    const wizard = wizards[element.tagName].edit(element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  firstUpdated() {
    panzoom(this.panzoomContainer);
    this.drawSubstationElements();
  }
  render() {
    return html`<div class="sldContainer">
      <div id="panzoom">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="svg"
          width="5000"
          height="5000"
        ></svg>
      </div>
    </div>`;
  }
}
SingleLineDiagramPlugin.styles = css`
    .sldContainer {
      overflow: hidden;
    }

    g[type='ConnectivityNode']:hover, g[type='Terminal']:hover {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }
  `;
__decorate([
  property()
], SingleLineDiagramPlugin.prototype, "doc", 2);
__decorate([
  query("#panzoom")
], SingleLineDiagramPlugin.prototype, "panzoomContainer", 2);
__decorate([
  query("#svg")
], SingleLineDiagramPlugin.prototype, "svg", 2);
