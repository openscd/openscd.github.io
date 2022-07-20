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
import "../../../_snowpack/pkg/@material/mwc-list/mwc-list-item.js";
import "../../../_snowpack/pkg/@material/mwc-icon.js";
import "../../filtered-list.js";
import {compareNames, identity} from "../../foundation.js";
import {gooseIcon} from "../../icons/icons.js";
export let GseControlEditor = class extends LitElement {
  renderList() {
    return html`<filtered-list
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
  render() {
    return html`${this.renderList()}`;
  }
};
GseControlEditor.styles = css`
    filtered-list {
      margin: 4px 8px 16px;
      background-color: var(--mdc-theme-surface);
    }

    .listitem.header {
      font-weight: 500;
    }

    mwc-list-item.hidden[noninteractive] + li[divider] {
      display: none;
    }
  `;
__decorate([
  property({attribute: false})
], GseControlEditor.prototype, "doc", 2);
GseControlEditor = __decorate([
  customElement("gse-control-editor")
], GseControlEditor);
