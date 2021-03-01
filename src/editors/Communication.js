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
import {LitElement, html, property, css} from "../../_snowpack/pkg/lit-element.js";
import {translate, get} from "../../_snowpack/pkg/lit-translate.js";
import {selectors, styles} from "./communication/foundation.js";
import {
  newWizardEvent,
  newActionEvent,
  createElement
} from "../foundation.js";
import "./communication/subnetwork-editor.js";
import {SubNetworkEditor} from "./communication/subnetwork-editor.js";
export default class CommunicationPlugin extends LitElement {
  openCreateSubNetworkWizard() {
    if (!this.doc.querySelector(selectors.Communication))
      this.dispatchEvent(newActionEvent({
        new: {
          parent: this.doc.documentElement,
          element: createElement(this.doc, "Communication", {}),
          reference: this.doc.querySelector(":root > IED") || this.doc.querySelector(":root > DataTypeTemplate") || null
        }
      }));
    this.dispatchEvent(newWizardEvent(SubNetworkEditor.wizard({
      parent: this.doc.documentElement.querySelector(selectors.Communication)
    })));
  }
  render() {
    if (!this.doc?.querySelector(selectors.SubNetwork))
      return html`<h1>
        <span style="color: var(--base1)"
          >${translate("communication.missing")}</span
        ><mwc-fab
          extended
          icon="add"
          label="${get("subnetwork.wizard.title.add")}"
          @click=${() => this.openCreateSubNetworkWizard()}
        ></mwc-fab>
      </h1>`;
    return html`<mwc-fab
        extended
        icon="add"
        label="${get("subnetwork.wizard.title.add")}"
        @click=${() => this.openCreateSubNetworkWizard()}
      ></mwc-fab
      >${Array.from(this.doc.querySelectorAll(selectors.SubNetwork) ?? []).map((subnetwork) => html`<subnetwork-editor .element=${subnetwork}></subnetwork-editor>`)}`;
  }
}
CommunicationPlugin.styles = css`
    ${styles}

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    :host {
      width: 100vw;
    }
  `;
__decorate([
  property()
], CommunicationPlugin.prototype, "doc", 2);
