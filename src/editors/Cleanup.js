"use strict";
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
  queryAll
} from "../../_snowpack/pkg/lit-element.js";
import {translate} from "../../_snowpack/pkg/lit-translate.js";
import "../../_snowpack/pkg/@material/mwc-button.js";
import "../../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import "../filtered-list.js";
import {
  identity,
  isPublic,
  newSubWizardEvent,
  newActionEvent
} from "../foundation.js";
import {editDataSetWizard} from "../wizards/dataset.js";
import {styles} from "./templates/foundation.js";
export default class Cleanup extends LitElement {
  constructor() {
    super(...arguments);
    this.disableDataSetClean = false;
    this.unreferencedDataSets = [];
    this.selectedItems = [];
  }
  getSelectedUnreferencedDataSetItems() {
    this.selectedItems = this.shadowRoot.querySelector(".cleanupUnreferencedDataSetsList").index;
  }
  cleanDataSets(cleanItems) {
    const actions = [];
    if (cleanItems) {
      cleanItems.forEach((item) => {
        actions.push({
          old: {
            parent: item.parentElement,
            element: item,
            reference: item.nextSibling
          }
        });
      });
    }
    return actions;
  }
  async firstUpdated() {
    this._cleanUnreferencedDataSetsList?.addEventListener("selected", () => {
      this.getSelectedUnreferencedDataSetItems();
    });
  }
  renderUnreferencedDataSets() {
    const unreferencedDataSets = [];
    Array.from(this.doc?.querySelectorAll("DataSet") ?? []).filter(isPublic).forEach((dataSet) => {
      const parent = dataSet.parentElement;
      const name = dataSet.getAttribute("name");
      const isReferenced = Array.from(parent?.querySelectorAll("GSEControl, ReportControl, SampledValueControl, LogControl") ?? []).some((cb) => cb.getAttribute("datSet") === name);
      if (parent && (!name || !isReferenced))
        unreferencedDataSets.push(dataSet);
    });
    this.unreferencedDataSets = unreferencedDataSets.sort((a, b) => {
      const aId = identity(a);
      const bId = identity(b);
      if (aId < bId) {
        return -1;
      }
      if (aId > bId) {
        return 1;
      }
      return 0;
    });
    return html`
      <h1>
        ${translate("cleanup.unreferencedDataSets.title")}
        (${unreferencedDataSets.length})
        <abbr slot="action">
          <mwc-icon-button
            icon="info"
            title="${translate("cleanup.unreferencedDataSets.tooltip")}"
          >
          </mwc-icon-button>
        </abbr>
      </h1>
      <filtered-list multi class="cleanupUnreferencedDataSetsList"
        >${Array.from(unreferencedDataSets.map((item) => html`<mwc-check-list-item twoline left value="${identity(item)}"
                ><span class="unreferencedDataSet"
                  >${item.getAttribute("name")}
                </span>
                <span>
                  <mwc-icon-button
                    label="Edit"
                    icon="edit"
                    class="editUnreferencedDataSet"
                    @click=${(e) => {
      e.stopPropagation();
      e.target?.dispatchEvent(newSubWizardEvent(() => editDataSetWizard(item)));
    }}
                  ></mwc-icon-button>
                </span>
                <span slot="secondary"
                  >${item.closest("IED")?.getAttribute("name")}
                  (${item.closest("IED")?.getAttribute("manufacturer") ?? "No manufacturer defined"})
                  -
                  ${item.closest("IED")?.getAttribute("type") ?? "No Type Defined"}</span
                >
              </mwc-check-list-item>`))}
      </filtered-list>
      <footer>
        <mwc-button
          outlined
          icon="delete"
          class="cleanupUnreferencedDataSetsDeleteButton"
          label="${translate("cleanup.unreferencedDataSets.deleteButton")} (${this.selectedItems.size || "0"})"
          ?disabled=${this.selectedItems.size === 0 || Array.isArray(this.selectedItems) && !this.selectedItems.length}
          @click=${(e) => {
      const cleanItems = Array.from(this.selectedItems.values()).map((index) => this.unreferencedDataSets[index]);
      const deleteActions = this.cleanDataSets(cleanItems);
      deleteActions.forEach((deleteAction) => e.target?.dispatchEvent(newActionEvent(deleteAction)));
    }}
        ></mwc-button>
      </footer>
    `;
  }
  render() {
    return html`
      <div class="cleanupUnreferencedDataSets">
        <section tabindex="0">${this.renderUnreferencedDataSets()}</section>
      </div>
    `;
  }
}
Cleanup.styles = css`
    ${styles}

    :host {
      width: 100vw;
    }

    .cleanupUnreferencedDataSets {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, 50%));
    }

    @media (max-width: 387px) {
      .cleanupUnreferencedDataSets {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }

    .editUnreferencedDataSet {
      --mdc-icon-size: 16px;
    }

    .cleanupUnreferencedDataSetsDeleteButton {
      float: right;
      margin-bottom: 10px;
      margin-right: 10px;
    }

    footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  `;
__decorate([
  property()
], Cleanup.prototype, "doc", 2);
__decorate([
  property()
], Cleanup.prototype, "disableDataSetClean", 2);
__decorate([
  property()
], Cleanup.prototype, "unreferencedDataSets", 2);
__decorate([
  property()
], Cleanup.prototype, "selectedItems", 2);
__decorate([
  query(".cleanupUnreferencedDataSetsDeleteButton")
], Cleanup.prototype, "_cleanUnreferencedDataSetsButton", 2);
__decorate([
  query(".cleanupUnreferencedDataSetsList")
], Cleanup.prototype, "_cleanUnreferencedDataSetsList", 2);
__decorate([
  queryAll("mwc-check-list-item")
], Cleanup.prototype, "_cleanUnreferencedDataSetItems", 2);
