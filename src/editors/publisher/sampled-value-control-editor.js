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
  property,
  query,
  state
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-button.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "./data-set-element-editor.js";
import "../../filtered-list.js";
import {compareNames, identity, selector} from "../../foundation.js";
import {smvIcon} from "../../icons/icons.js";
import {styles} from "./foundation.js";
export let SampledValueControlEditor = class extends LitElement {
  selectSMVControl(evt) {
    const id = evt.target.selected.value;
    const smvControl = this.doc.querySelector(selector("SampledValueControl", id));
    if (smvControl) {
      this.selectedSampledValueControl = smvControl.parentElement?.querySelector(`DataSet[name="${smvControl.getAttribute("datSet")}"]`);
      evt.target.classList.add("hidden");
      this.selectSampledValueControlButton.classList.remove("hidden");
    }
  }
  renderElementEditorContainer() {
    if (this.selectedSampledValueControl !== void 0)
      return html`<div class="elementeditorcontainer">
        <data-set-element-editor
          .element=${this.selectedSampledValueControl}
        ></data-set-element-editor>
      </div>`;
    return html``;
  }
  renderSelectionList() {
    return html`<filtered-list
      activatable
      @action=${this.selectSMVControl}
      class="selectionlist"
      >${Array.from(this.doc.querySelectorAll("IED")).sort(compareNames).flatMap((ied) => {
      const ieditem = html`<mwc-list-item
              class="listitem header"
              noninteractive
              graphic="icon"
              value="${Array.from(ied.querySelectorAll("SampledValueControl")).map((element) => {
        const id = identity(element);
        return typeof id === "string" ? id : "";
      }).join(" ")}"
            >
              <span>${ied.getAttribute("name")}</span>
              <mwc-icon slot="graphic">developer_board</mwc-icon>
            </mwc-list-item>
            <li divider role="separator"></li>`;
      const sampledValueControls = Array.from(ied.querySelectorAll("SampledValueControl")).map((reportCb) => html`<mwc-list-item
                twoline
                value="${identity(reportCb)}"
                graphic="icon"
                ><span>${reportCb.getAttribute("name")}</span
                ><span slot="secondary">${identity(reportCb)}</span>
                <mwc-icon slot="graphic">${smvIcon}</mwc-icon>
              </mwc-list-item>`);
      return [ieditem, ...sampledValueControls];
    })}</filtered-list
    >`;
  }
  renderToggleButton() {
    return html`<mwc-button
      outlined
      label="${translate("publisher.selectbutton", {type: "SMV"})}"
      @click=${() => {
      this.selectionList.classList.remove("hidden");
      this.selectSampledValueControlButton.classList.add("hidden");
    }}
    ></mwc-button>`;
  }
  render() {
    return html`${this.renderToggleButton()}
      <div class="content">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
  }
};
SampledValueControlEditor.styles = css`
    ${styles}

    data-set-element-editor {
      flex: auto;
    }
  `;
__decorate([
  property({attribute: false})
], SampledValueControlEditor.prototype, "doc", 2);
__decorate([
  state()
], SampledValueControlEditor.prototype, "selectedSampledValueControl", 2);
__decorate([
  query(".selectionlist")
], SampledValueControlEditor.prototype, "selectionList", 2);
__decorate([
  query("mwc-button")
], SampledValueControlEditor.prototype, "selectSampledValueControlButton", 2);
SampledValueControlEditor = __decorate([
  customElement("sampled-value-control-editor")
], SampledValueControlEditor);
