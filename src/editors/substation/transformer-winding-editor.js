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
  customElement,
  html,
  LitElement,
  property
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-fab.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../../_snowpack/pkg/@material/mwc-icon-button.js";
import "../../../_snowpack/pkg/@material/mwc-menu.js";
import "../../action-icon.js";
import "../../action-pane.js";
import {styles} from "./foundation.js";
import {getChildElementsByTagName, newWizardEvent} from "../../foundation.js";
import {wizards} from "../../wizards/wizard-library.js";
export let TransformerWindingEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.showfunctions = false;
  }
  get label() {
    const name = `${this.element.hasAttribute("name") ? `${this.element.getAttribute("name")}` : ""}`;
    const description = `${this.element.hasAttribute("desc") ? ` - ${this.element.getAttribute("desc")}` : ""}`;
    return `${name}${description}`;
  }
  openEditWizard() {
    const wizard = wizards["TransformerWinding"].edit(this.element);
    if (wizard)
      this.dispatchEvent(newWizardEvent(wizard));
  }
  renderLNodes() {
    const lNodes = getChildElementsByTagName(this.element, "LNode");
    return lNodes.length ? html`<div class="container lnode">
          ${lNodes.map((lNode) => html`<l-node-editor
                .doc=${this.doc}
                .element=${lNode}
              ></l-node-editor>`)}
        </div>` : html``;
  }
  renderEqFunctions() {
    if (!this.showfunctions)
      return html``;
    const eqFunctions = getChildElementsByTagName(this.element, "EqFunction");
    return eqFunctions.length ? html` ${eqFunctions.map((eqFunction) => html`<eq-function-editor
              .doc=${this.doc}
              .element=${eqFunction}
              ?showfunctions=${this.showfunctions}
            ></eq-function-editor>`)}` : html``;
  }
  render() {
    return html`<action-pane label="${this.label}">
      <abbr slot="action" title="${translate("edit")}">
        <mwc-icon-button
          icon="edit"
          @click=${() => this.openEditWizard()}
        ></mwc-icon-button>
      </abbr>
      ${this.renderLNodes()} ${this.renderEqFunctions()}
    </action-pane> `;
  }
};
TransformerWindingEditor.styles = css`
    ${styles}

    :host(.moving) {
      opacity: 0.3;
    }

    abbr {
      text-decoration: none;
      border-bottom: none;
    }
  `;
__decorate([
  property({attribute: false})
], TransformerWindingEditor.prototype, "doc", 2);
__decorate([
  property({attribute: false})
], TransformerWindingEditor.prototype, "element", 2);
__decorate([
  property({type: Boolean})
], TransformerWindingEditor.prototype, "showfunctions", 2);
__decorate([
  property({type: String})
], TransformerWindingEditor.prototype, "label", 1);
TransformerWindingEditor = __decorate([
  customElement("transformer-winding-editor")
], TransformerWindingEditor);
