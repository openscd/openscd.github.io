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
  LitElement,
  customElement,
  html,
  property,
  css
} from "../../../_snowpack/pkg/lit-element.js";
import {translate, get} from "../../../_snowpack/pkg/lit-translate.js";
import {
  newWizardEvent,
  newActionEvent,
  getValue,
  getMultiplier,
  patterns,
  compareNames,
  createElement,
  getReference
} from "../../foundation.js";
import {styles, isCreateOptions} from "./foundation.js";
import "./connectedap-editor.js";
import {createConnectedApWizard} from "./connectedap-editor.js";
const initial = {
  type: "8-MMS",
  bitrate: "100",
  multiplier: "M"
};
function getBitRateAction(oldBitRate, BitRate, multiplier, SubNetwork) {
  if (oldBitRate === null)
    return {
      new: {
        parent: SubNetwork,
        element: new DOMParser().parseFromString(`<BitRate unit="b/s" ${multiplier === null ? "" : `multiplier="${multiplier}"`}>${BitRate === null ? "" : BitRate}</BitRate>`, "application/xml").documentElement,
        reference: SubNetwork.firstElementChild
      }
    };
  if (BitRate === null)
    return {
      old: {
        parent: SubNetwork,
        element: oldBitRate,
        reference: oldBitRate.nextElementSibling
      }
    };
  const newBitRate = oldBitRate.cloneNode(false);
  newBitRate.textContent = BitRate;
  if (multiplier === null)
    newBitRate.removeAttribute("multiplier");
  else
    newBitRate.setAttribute("multiplier", multiplier);
  return {
    old: {element: oldBitRate},
    new: {element: newBitRate}
  };
}
export function updateSubNetworkAction(element) {
  return (inputs, wizard) => {
    const name = inputs.find((i) => i.label === "name").value;
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const type = getValue(inputs.find((i) => i.label === "type"));
    const BitRate = getValue(inputs.find((i) => i.label === "BitRate"));
    const multiplier = getMultiplier(inputs.find((i) => i.label === "BitRate"));
    let subNetworkAction;
    let bitRateAction;
    if (name === element.getAttribute("name") && desc === element.getAttribute("desc") && type === element.getAttribute("type")) {
      subNetworkAction = null;
    } else {
      const newElement = element.cloneNode(false);
      newElement.setAttribute("name", name);
      if (desc === null)
        newElement.removeAttribute("desc");
      else
        newElement.setAttribute("desc", desc);
      if (type === null)
        newElement.removeAttribute("type");
      else
        newElement.setAttribute("type", type);
      subNetworkAction = {old: {element}, new: {element: newElement}};
    }
    if (BitRate === (element.querySelector("SubNetwork > BitRate")?.textContent?.trim() ?? null) && multiplier === (element.querySelector("SubNetwork > BitRate")?.getAttribute("multiplier") ?? null)) {
      bitRateAction = null;
    } else {
      bitRateAction = getBitRateAction(element.querySelector("SubNetwork > BitRate"), BitRate, multiplier, subNetworkAction?.new.element ?? element);
    }
    const actions = [];
    if (subNetworkAction)
      actions.push(subNetworkAction);
    if (bitRateAction)
      actions.push(bitRateAction);
    return actions;
  };
}
export function createSubNetworkAction(parent) {
  return (inputs, wizard) => {
    const name = getValue(inputs.find((i) => i.label === "name"));
    const desc = getValue(inputs.find((i) => i.label === "desc"));
    const type = getValue(inputs.find((i) => i.label === "type"));
    const BitRate = getValue(inputs.find((i) => i.label === "BitRate"));
    const multiplier = getMultiplier(inputs.find((i) => i.label === "BitRate"));
    const element = createElement(parent.ownerDocument, "SubNetwork", {
      name,
      desc,
      type
    });
    if (BitRate !== null) {
      const bitRateElement = createElement(parent.ownerDocument, "BitRate", {
        unit: "b/s",
        multiplier
      });
      bitRateElement.textContent = BitRate;
      element.appendChild(bitRateElement);
    }
    const action = {
      new: {
        parent,
        element,
        reference: getReference(parent, "SubNetwork")
      }
    };
    return [action];
  };
}
export function subNetworkWizard(options) {
  const [
    heading,
    actionName,
    actionIcon,
    action,
    name,
    desc,
    type,
    BitRate,
    multiplier
  ] = isCreateOptions(options) ? [
    get("subnetwork.wizard.title.add"),
    get("add"),
    "add",
    createSubNetworkAction(options.parent),
    "",
    "",
    initial.type,
    initial.bitrate,
    initial.multiplier
  ] : [
    get("subnetwork.wizard.title.edit"),
    get("save"),
    "edit",
    updateSubNetworkAction(options.element),
    options.element.getAttribute("name"),
    options.element.getAttribute("desc"),
    options.element.getAttribute("type"),
    options.element.querySelector("SubNetwork > BitRate")?.textContent?.trim() ?? null,
    options.element.querySelector("SubNetwork > BitRate")?.getAttribute("multiplier") ?? null
  ];
  return [
    {
      title: heading,
      primary: {
        icon: actionIcon,
        label: actionName,
        action
      },
      content: [
        html`<wizard-textfield
          label="name"
          .maybeValue=${name}
          helper="${translate("subnetwork.wizard.nameHelper")}"
          required
          validationMessage="${translate("textfield.required")}"
          dialogInitialFocus
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="desc"
          .maybeValue=${desc}
          nullable
          helper="${translate("subnetwork.wizard.descHelper")}"
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="type"
          .maybeValue=${type}
          nullable
          helper="${translate("subnetwork.wizard.typeHelper")}"
          pattern="${patterns.normalizedString}"
        ></wizard-textfield>`,
        html`<wizard-textfield
          label="BitRate"
          .maybeValue=${BitRate}
          nullable
          unit="b/s"
          .multipliers=${[null, "M"]}
          .multiplier=${multiplier}
          helper="${translate("subnetwork.wizard.bitrateHelper")}"
          required
          validationMessage="${translate("textfield.nonempty")}"
          pattern="${patterns.decimal}"
        ></wizard-textfield>`
      ]
    }
  ];
}
export let SubNetworkEditor = class extends LitElement {
  get name() {
    return this.element.getAttribute("name") ?? "";
  }
  get desc() {
    return this.element.getAttribute("desc") ?? null;
  }
  get type() {
    return this.element.getAttribute("type") ?? null;
  }
  get bitrate() {
    const V = this.element.querySelector("BitRate");
    if (V === null)
      return null;
    const v = V.textContent ?? "";
    const m = V.getAttribute("multiplier");
    const u = m === null ? "b/s" : " " + m + "b/s";
    return v ? v + u : null;
  }
  openConnectedAPwizard() {
    this.dispatchEvent(newWizardEvent(createConnectedApWizard(this.element)));
  }
  openEditWizard() {
    this.dispatchEvent(newWizardEvent(subNetworkWizard({element: this.element})));
  }
  remove() {
    if (this.element)
      this.dispatchEvent(newActionEvent({
        old: {
          parent: this.element.parentElement,
          element: this.element,
          reference: this.element.nextElementSibling
        }
      }));
  }
  renderSubNetworkSpecs() {
    if (!this.type && !this.bitrate)
      return html``;
    return html`(${this.type}${this.type && this.bitrate ? html`&mdash;` : html``}${this.bitrate})`;
  }
  renderHeader() {
    return html`<h1>
      ${this.name} ${this.desc === null ? "" : html`&mdash;`} ${this.desc}
      ${this.renderSubNetworkSpecs()}
      <abbr title="${translate("add")}">
        <mwc-icon-button
          icon="playlist_add"
          @click="${() => this.openConnectedAPwizard()}"
        ></mwc-icon-button>
      </abbr>
      <nav>
        <abbr title="${translate("edit")}">
          <mwc-icon-button
            icon="edit"
            @click=${() => this.openEditWizard()}
          ></mwc-icon-button>
        </abbr>
        <abbr title="${translate("remove")}">
          <mwc-icon-button
            icon="delete"
            @click=${() => this.remove()}
          ></mwc-icon-button>
        </abbr>
      </nav>
    </h1>`;
  }
  renderIedContainer() {
    return Array.from(this.element.querySelectorAll("ConnectedAP") ?? []).map((connAP) => connAP.getAttribute("iedName")).filter((v, i, a) => a.indexOf(v) === i).sort(compareNames).map((iedName) => html` <section id="iedSection" tabindex="0">
          <h3>${iedName}</h3>
          <div id="connApContainer">
            ${Array.from(this.element.ownerDocument.querySelectorAll(`ConnectedAP[iedName="${iedName}"]`)).map((connectedAP) => html`<connectedap-editor
                  class="${connectedAP.parentElement !== this.element ? "disabled" : ""}"
                  .element=${connectedAP}
                ></connectedap-editor>`)}
          </div>
        </section>`);
  }
  render() {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      <div id="connAPContainer">${this.renderIedContainer()}</div>
    </section>`;
  }
};
SubNetworkEditor.styles = css`
    ${styles}

    #iedSection {
      background-color: var(--mdc-theme-on-primary);
      margin: 0px;
    }

    #iedSection:not(:focus):not(:focus-within) .disabled {
      display: none;
    }

    #iedSection .disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    #connAPContainer {
      display: grid;
      box-sizing: border-box;
      gap: 12px;
      padding: 8px 12px 16px;
      grid-template-columns: repeat(auto-fit, minmax(150px, auto));
    }

    #connApContainer {
      display: grid;
      box-sizing: border-box;
      padding: 8px 12px 8px;
      grid-template-columns: repeat(auto-fit, minmax(64px, auto));
    }
  `;
__decorate([
  property()
], SubNetworkEditor.prototype, "element", 2);
__decorate([
  property()
], SubNetworkEditor.prototype, "name", 1);
__decorate([
  property()
], SubNetworkEditor.prototype, "desc", 1);
__decorate([
  property()
], SubNetworkEditor.prototype, "type", 1);
__decorate([
  property()
], SubNetworkEditor.prototype, "bitrate", 1);
SubNetworkEditor = __decorate([
  customElement("subnetwork-editor")
], SubNetworkEditor);
