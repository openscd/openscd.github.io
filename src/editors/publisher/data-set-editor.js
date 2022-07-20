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
import {compareNames, identity} from "../../foundation.js";
export let DataSetEditor = class extends LitElement {
  renderList() {
    return html`<filtered-list
      >${Array.from(this.doc.querySelectorAll("IED")).sort(compareNames).flatMap((ied) => {
      const ieditem = html`<mwc-list-item
              class="listitem header"
              noninteractive
              graphic="icon"
            >
              <span>${ied.getAttribute("name")}</span>
              <mwc-icon slot="graphic">developer_board</mwc-icon>
            </mwc-list-item>
            <li divider role="separator"></li>`;
      const dataSets = Array.from(ied.querySelectorAll("DataSet")).map((reportCb) => html`<mwc-list-item twoline value="${identity(reportCb)}"
                ><span>${reportCb.getAttribute("name")}</span
                ><span slot="secondary">${identity(reportCb)}</span>
              </mwc-list-item>`);
      return [ieditem, ...dataSets];
    })}</filtered-list
    >`;
  }
  render() {
    return html`${this.renderList()}`;
  }
};
DataSetEditor.styles = css`
    filtered-list {
      margin: 4px 8px 16px;
      background-color: var(--mdc-theme-surface);
    }

    .listitem.header {
      font-weight: 500;
    }
  `;
__decorate([
  property({attribute: false})
], DataSetEditor.prototype, "doc", 2);
DataSetEditor = __decorate([
  customElement("data-set-editor")
], DataSetEditor);
