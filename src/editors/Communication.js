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
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "./communication/subnetwork-editor.js";
import {
  newWizardEvent,
  newActionEvent,
  createElement,
  isPublic
} from "../foundation.js";
import {createSubNetworkWizard} from "../wizards/subnetwork.js";
export default class CommunicationPlugin extends LitElement {
  createCommunication() {
    this.dispatchEvent(newActionEvent({
      new: {
        parent: this.doc.documentElement,
        element: createElement(this.doc, "Communication", {})
      }
    }));
  }
  openCreateSubNetworkWizard() {
    const parent = this.doc.querySelector(":root > Communication");
    if (!parent)
      this.createCommunication();
    this.dispatchEvent(newWizardEvent(createSubNetworkWizard(parent)));
  }
  render() {
    if (!this.doc?.querySelector(":root > Communication >SubNetwork"))
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
      ></mwc-fab>
      <section>
        ${Array.from(this.doc.querySelectorAll("SubNetwork") ?? []).filter(isPublic).map((subnetwork) => html`<subnetwork-editor
                .element=${subnetwork}
              ></subnetwork-editor>`)}
      </section> `;
  }
}
CommunicationPlugin.styles = css`
    :host {
      width: 100vw;
    }

    section {
      outline: none;
      padding: 8px 12px 16px;
    }

    subnetwork-editor {
      margin: 8px 12px 16px;
    }

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }
  `;
__decorate([
  property()
], CommunicationPlugin.prototype, "doc", 2);
