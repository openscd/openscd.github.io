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
  query,
  state
} from "../../_snowpack/pkg/lit-element.js";
import panzoom from "../../_snowpack/pkg/panzoom.js";
import {identity, getPathNameAttribute, newWizardEvent, getNameAttribute, getDescriptionAttribute} from "../foundation.js";
import {
  compareNames
} from "../foundation.js";
import {
  getAbsolutePosition,
  createTerminalElement,
  createBusBarElement,
  createVoltageLevelElement,
  createBayElement,
  createConductingEquipmentElement,
  createConnectivityNodeElement,
  getBusBarLength,
  createPowerTransformerElement,
  getAbsolutePositionBusBar,
  drawBusBarRoute,
  getDirections,
  getAbsolutePositionTerminal,
  drawCNodeConnections,
  getConnectivityNodesDrawingPosition,
  createSubstationElement
} from "./singlelinediagram/sld-drawing.js";
import {
  isBusBar,
  getConnectedTerminals,
  getCommonParentElement
} from "./singlelinediagram/foundation.js";
import {isSCLNamespace} from "../schemas.js";
import {wizards} from "./singlelinediagram/wizards/wizard-library.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../_snowpack/pkg/@material/mwc-select.js";
import "../../_snowpack/pkg/@material/mwc-textfield.js";
export default class SingleLineDiagramPlugin extends LitElement {
  get substations() {
    return Array.from(this.doc.querySelectorAll(":root > Substation")).sort((a, b) => compareNames(a, b));
  }
  getPowerTransformers(parentElement) {
    return Array.from(parentElement.querySelectorAll("PowerTransformer")).filter(isSCLNamespace);
  }
  getVoltageLevels(substationElement) {
    return Array.from(substationElement.querySelectorAll("VoltageLevel")).filter(isSCLNamespace);
  }
  getBusBars(voltageLevelElement) {
    return Array.from(voltageLevelElement.querySelectorAll("Bay")).filter(isSCLNamespace).filter((bay) => isBusBar(bay));
  }
  getBays(voltageLevelElement) {
    return Array.from(voltageLevelElement.querySelectorAll("Bay")).filter(isSCLNamespace).filter((bay) => !isBusBar(bay));
  }
  getConductingEquipments(bayElement) {
    return Array.from(bayElement.querySelectorAll("ConductingEquipment")).filter(isSCLNamespace);
  }
  getConnectivityNode(bayElement) {
    return Array.from(bayElement.querySelectorAll("ConnectivityNode")).filter(isSCLNamespace).filter((cNode) => cNode.getAttribute("name") !== "grounded");
  }
  findEquipment(parentElement, pathName) {
    return Array.from(parentElement.querySelectorAll("ConductingEquipment, PowerTransformer")).filter(isSCLNamespace).filter((element) => element.querySelector(`Terminal[connectivityNode="${pathName}"]`));
  }
  drawSubstation() {
    const substationGroup = createSubstationElement(this.selectedSubstation);
    this.svg.appendChild(substationGroup);
    this.drawPowerTransformers(this.selectedSubstation, substationGroup);
    this.drawVoltageLevels(this.selectedSubstation, substationGroup);
  }
  drawPowerTransformers(parentElement, parentGroup) {
    this.getPowerTransformers(parentElement).forEach((powerTransformerElement) => this.drawPowerTransformer(parentGroup, powerTransformerElement));
  }
  drawPowerTransformer(parentGroup, powerTransformerElement) {
    const powerTransformerGroup = createPowerTransformerElement(powerTransformerElement, (event) => this.openEditWizard(event, powerTransformerElement));
    parentGroup.appendChild(powerTransformerGroup);
  }
  drawVoltageLevels(substationElement, substationGroup) {
    this.getVoltageLevels(substationElement).forEach((voltageLevelElement) => {
      const voltageLevelGroup = createVoltageLevelElement(voltageLevelElement);
      substationGroup.appendChild(voltageLevelGroup);
      this.drawPowerTransformers(voltageLevelElement, voltageLevelGroup);
      this.drawBays(voltageLevelElement, voltageLevelGroup);
      this.drawBusBars(voltageLevelElement, voltageLevelGroup);
    });
    this.getVoltageLevels(substationElement).forEach((voltageLevelElement) => {
      this.getBusBars(voltageLevelElement).forEach((busbarElement) => {
        this.drawBusBarConnections(substationElement, this.svg, busbarElement);
      });
      this.getBays(voltageLevelElement).forEach((bayElement) => {
        this.drawBayConnections(substationElement, this.svg, bayElement);
      });
    });
  }
  drawBays(voltageLevelElement, voltageLevelGroup) {
    this.getBays(voltageLevelElement).forEach((bayElement) => {
      const bayGroup = createBayElement(bayElement);
      voltageLevelGroup.appendChild(bayGroup);
      this.drawPowerTransformers(bayElement, bayGroup);
      this.drawConductingEquipments(bayElement, bayGroup);
      this.drawConnectivityNodes(bayElement, bayGroup);
    });
  }
  drawConductingEquipments(bayElement, bayGroup) {
    this.getConductingEquipments(bayElement).filter((conductingEquipmentElement) => Array.from(conductingEquipmentElement.querySelectorAll("Terminal")).filter((terminal) => terminal.getAttribute("cNodeName") !== "grounded").length !== 0).forEach((conductingEquipmentElement) => {
      const conductingEquipmentGroup = createConductingEquipmentElement(conductingEquipmentElement, (event) => this.openEditWizard(event, conductingEquipmentElement));
      bayGroup.appendChild(conductingEquipmentGroup);
    });
  }
  drawConnectivityNodes(bayElement, bayGroup) {
    this.getConnectivityNode(bayElement).filter((cNode) => getConnectedTerminals(cNode).length > 0).forEach((cNode) => {
      const cNodegroup = createConnectivityNodeElement(cNode, (event) => this.openEditWizard(event, cNode));
      bayGroup.appendChild(cNodegroup);
    });
  }
  drawBayConnections(rootElement, rootGroup, bayElement) {
    this.getConnectivityNode(bayElement).forEach((cNode) => {
      this.findEquipment(rootElement, getPathNameAttribute(cNode)).forEach((equipmentElement) => {
        const commonParentElement = getCommonParentElement(cNode, equipmentElement, bayElement);
        const sides = getDirections(equipmentElement, cNode);
        const elementsTerminalPosition = getAbsolutePositionTerminal(equipmentElement, sides.startDirection);
        const cNodePosition = getConnectivityNodesDrawingPosition(cNode, sides.endDirection);
        rootGroup.querySelectorAll(`g[id="${identity(commonParentElement)}"]`).forEach((eq) => drawCNodeConnections(cNodePosition, elementsTerminalPosition, eq));
        const terminalElement = equipmentElement.querySelector(`Terminal[connectivityNode="${cNode.getAttribute("pathName")}"]`);
        const terminal = createTerminalElement(terminalElement, sides.startDirection, (event) => this.openEditWizard(event, terminalElement));
        rootGroup.querySelectorAll(`g[id="${identity(equipmentElement)}"]`).forEach((eq) => eq.appendChild(terminal));
      });
    });
  }
  drawBusBars(voltageLevelElement, voltageLevelGroup) {
    this.getBusBars(voltageLevelElement).forEach((busbarElement) => this.drawBusBar(voltageLevelElement, voltageLevelGroup, busbarElement));
  }
  drawBusBar(parentElement, parentGroup, busbarElement) {
    const busBarGroup = createBusBarElement(busbarElement, getBusBarLength(parentElement), (event) => this.openEditWizard(event, busbarElement));
    parentGroup.appendChild(busBarGroup);
  }
  drawBusBarConnections(rootElement, rootGroup, busbarElement) {
    const pathName = getPathNameAttribute(busbarElement.children[0]);
    const busBarPosition = getAbsolutePositionBusBar(busbarElement);
    this.findEquipment(rootElement, pathName).forEach((element) => {
      const parentElement = element.parentElement;
      const elementPosition = getAbsolutePosition(element);
      const elementsTerminalSide = busBarPosition.y < elementPosition.y ? "top" : "bottom";
      const elementsTerminalPosition = getAbsolutePositionTerminal(element, elementsTerminalSide);
      const busbarTerminalPosition = {
        x: elementsTerminalPosition.x,
        y: busBarPosition.y
      };
      const terminalElement = element.querySelector(`Terminal[connectivityNode="${pathName}"]`);
      rootGroup.querySelectorAll(`g[id="${identity(parentElement)}"]`).forEach((eq) => drawBusBarRoute(busbarTerminalPosition, elementsTerminalPosition, eq));
      const terminal = createTerminalElement(terminalElement, elementsTerminalSide, (event) => this.openEditWizard(event, terminalElement));
      rootGroup.querySelectorAll(`g[id="${identity(element)}"]`).forEach((eq) => eq.appendChild(terminal));
    });
  }
  clearSVG() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.lastChild);
    }
  }
  drawSVGElements() {
    this.clearSVG();
    if (this.selectedSubstation) {
      this.drawSubstation();
      const bbox = this.svg.getBBox();
      this.svg.setAttribute("viewBox", bbox.x - 10 + " " + (bbox.y - 10) + " " + (bbox.width + 20) + " " + (bbox.height + 20));
      this.svg.setAttribute("width", bbox.width + 20 + "px");
      this.svg.setAttribute("height", bbox.height + 20 + "px");
      panzoom(this.panzoomContainer, {
        zoomSpeed: 0.2,
        maxZoom: 1.5,
        minZoom: 0.2,
        initialZoom: 0.5
      });
    }
  }
  openEditWizard(event, element) {
    const wizard = wizards[element.tagName].edit(element);
    if (wizard) {
      this.dispatchEvent(newWizardEvent(wizard));
      event.stopPropagation();
    }
  }
  firstUpdated() {
    this.drawSVGElements();
  }
  onSelect(event) {
    this.selectedSubstation = this.substations[event.detail.index];
    this.drawSVGElements();
  }
  renderSubstationSelector() {
    const substationList = this.substations;
    if (substationList.length > 0) {
      if (this.selectedSubstation === void 0) {
        this.selectedSubstation = substationList[0];
      }
      if (substationList.length > 1) {
        const selectedSubstationName = getNameAttribute(this.selectedSubstation);
        return html`
          <mwc-select id="substationSelector"
                      label="${translate("sld.substationSelector")}"
                      @selected=${this.onSelect}>
            ${substationList.map((substation) => {
          const name2 = getNameAttribute(substation);
          const description2 = getDescriptionAttribute(substation);
          return html`
                  <mwc-list-item value="${name2}"
                                 ?selected=${name2 === selectedSubstationName}>
                    ${name2}${description2 !== void 0 ? " (" + description2 + ")" : ""}
                  </mwc-list-item>`;
        })}
          </mwc-select>
        `;
      }
      const name = getNameAttribute(this.selectedSubstation);
      const description = getDescriptionAttribute(this.selectedSubstation);
      return html`
        <mwc-textfield label="${translate("substation.name")}"
                       value="${name}${description !== void 0 ? " (" + description + ")" : ""}"
                       id="selectedSubstation"
                       readonly
                       disabled>
        </mwc-textfield>
      `;
    }
    return html`
      <h1>
        <span id="noSubstationSelector">${translate("substation.missing")}</span>
      </h1>
    `;
  }
  render() {
    return html`
      ${this.renderSubstationSelector()}

      <div class="sldContainer">
        <div id="panzoom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            id="svg"
          ></svg>
        </div>
      </div>`;
  }
}
SingleLineDiagramPlugin.styles = css`
    h1 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      line-height: 48px;
      padding-left: 0.3em;
    }

    #substationSelector {
      width: 30vw;
      margin: 0.67em 0 0 0.67em;
    }

    #selectedSubstation {
      width: 30vw;
      margin: 0.67em 0 0 0.67em;
    }

    #noSubstationSelector {
      color: var(--base1)
    }

    .sldContainer {
      overflow: hidden;
    }

    g {
      pointer-events: bounding-box;
    }

    g[type='Busbar']:hover,
    g[type='ConductingEquipment']:hover,
    g[type='ConnectivityNode']:hover,
    g[type='PowerTransformer']:hover,
    g[type='Terminal']:hover {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }
  `;
__decorate([
  property({attribute: false})
], SingleLineDiagramPlugin.prototype, "doc", 2);
__decorate([
  state()
], SingleLineDiagramPlugin.prototype, "selectedSubstation", 2);
__decorate([
  query("#panzoom")
], SingleLineDiagramPlugin.prototype, "panzoomContainer", 2);
__decorate([
  query("#svg")
], SingleLineDiagramPlugin.prototype, "svg", 2);
