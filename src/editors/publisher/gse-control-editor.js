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
  state,
  query
} from "../../../_snowpack/pkg/lit-element.js";
import {translate} from "../../../_snowpack/pkg/lit-translate.js";
import "../../../_snowpack/pkg/@material/mwc-button.js";
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "./data-set-element-editor.js";
import "./gse-control-element-editor.js";
import "../../filtered-list.js";
import {gooseIcon} from "../../icons/icons.js";
import {compareNames, identity, find} from "../../foundation.js";
import {styles, updateElementReference} from "./foundation.js";
export let GseControlEditor = class extends LitElement {
  constructor() {
    super(...arguments);
    this.editCount = -1;
  }
  update(props) {
    if (props.has("doc") && this.selectedGseControl) {
      const newGseControl = updateElementReference(this.doc, this.selectedGseControl);
      this.selectedGseControl = newGseControl ?? void 0;
      this.selectedDataSet = this.selectedGseControl ? updateElementReference(this.doc, this.selectedDataSet) : void 0;
      if (!newGseControl && this.selectionList && this.selectionList.selected)
        this.selectionList.selected.selected = false;
    }
    super.update(props);
  }
  selectGSEControl(evt) {
    const id = evt.target.selected.value;
    const gseControl = find(this.doc, "GSEControl", id);
    if (!gseControl)
      return;
    this.selectedGseControl = gseControl;
    if (gseControl) {
      this.selectedDataSet = gseControl.parentElement?.querySelector(`DataSet[name="${gseControl.getAttribute("datSet")}"]`);
      evt.target.classList.add("hidden");
      this.selectGSEControlButton.classList.remove("hidden");
    }
  }
  renderElementEditorContainer() {
    if (this.selectedGseControl !== void 0)
      return html`<div class="elementeditorcontainer">
        <data-set-element-editor
          .element=${this.selectedDataSet}
        ></data-set-element-editor>
        <gse-control-element-editor
          .editCount=${this.editCount}
          .doc=${this.doc}
          .element=${this.selectedGseControl}
        ></gse-control-element-editor>
      </div>`;
    return html``;
  }
  renderSelectionList() {
    return html`<filtered-list
      activatable
      @action=${this.selectGSEControl}
      class="selectionlist"
      >${Array.from(this.doc.querySelectorAll("IED")).sort(compareNames).flatMap((ied) => {
      const ieditem = html`<mwc-list-item
              class="listitem header"
              noninteractive
              graphic="icon"
              value="${Array.from(ied.querySelectorAll("GSEControl")).map((element) => {
        const id = identity(element);
        return typeof id === "string" ? id : "";
      }).join(" ")}"
            >
              <span>${ied.getAttribute("name")}</span>
              <mwc-icon slot="graphic">developer_board</mwc-icon>
            </mwc-list-item>
            <li divider role="separator"></li>`;
      const gseControls = Array.from(ied.querySelectorAll("GSEControl")).map((reportCb) => html`<mwc-list-item
                twoline
                value="${identity(reportCb)}"
                graphic="icon"
                ><span>${reportCb.getAttribute("name")}</span
                ><span slot="secondary">${identity(reportCb)}</span>
                <mwc-icon slot="graphic">${gooseIcon}</mwc-icon>
              </mwc-list-item>`);
      return [ieditem, ...gseControls];
    })}</filtered-list
    >`;
  }
  renderToggleButton() {
    return html`<mwc-button
      outlined
      label="${translate("publisher.selectbutton", {type: "GOOSE"})}"
      @click=${() => {
      this.selectionList.classList.remove("hidden");
      this.selectGSEControlButton.classList.add("hidden");
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
GseControlEditor.styles = css`
    ${styles}

    .elementeditorcontainer {
      flex: 65%;
      margin: 4px 8px 4px 4px;
      background-color: var(--mdc-theme-surface);
      overflow-y: scroll;
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      grid-template-columns: repeat(3, 1fr);
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    gse-control-element-editor {
      grid-column: 2 / 4;
    }

    @media (max-width: 950px) {
      .elementeditorcontainer {
        display: block;
      }
    }
  `;
__decorate([
  property({attribute: false})
], GseControlEditor.prototype, "doc", 2);
__decorate([
  property({type: Number})
], GseControlEditor.prototype, "editCount", 2);
__decorate([
  state()
], GseControlEditor.prototype, "selectedGseControl", 2);
__decorate([
  state()
], GseControlEditor.prototype, "selectedDataSet", 2);
__decorate([
  query(".selectionlist")
], GseControlEditor.prototype, "selectionList", 2);
__decorate([
  query("mwc-button")
], GseControlEditor.prototype, "selectGSEControlButton", 2);
GseControlEditor = __decorate([
  customElement("gse-control-editor")
], GseControlEditor);
