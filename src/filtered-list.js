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
import {List} from "../_snowpack/pkg/@material/mwc-list.js";
import {CheckListItem} from "../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js";
import {
  css,
  customElement,
  html,
  internalProperty,
  property,
  query
} from "../_snowpack/pkg/lit-element.js";
export let Filterlist = class extends List {
  constructor() {
    super();
    this.disableCheckAll = false;
    this.addEventListener("selected", () => {
      this.requestUpdate();
    });
  }
  get existCheckListItem() {
    return this.items.some((item) => item instanceof CheckListItem);
  }
  get isAllSelected() {
    return this.items.filter((item) => item instanceof CheckListItem).every((checkItem) => checkItem.selected);
  }
  get isSomeSelected() {
    return this.items.filter((item) => item instanceof CheckListItem).some((checkItem) => checkItem.selected);
  }
  onCheckAll() {
    const select = !this.isAllSelected;
    this.items.forEach((item) => item.selected = select);
  }
  onFilterInput() {
    this.items.forEach((item) => {
      const text = (item.innerText + "\n" + Array.from(item.children).map((child) => child.innerText).join("\n")).toUpperCase();
      const terms = this.searchField.value.toUpperCase().split(" ");
      terms.some((term) => !text.includes(term)) ? item.classList.add("hidden") : item.classList.remove("hidden");
    });
  }
  onListItemConnected(e) {
    super.onListItemConnected(e);
    this.requestUpdate();
  }
  renderCheckAll() {
    return this.existCheckListItem && !this.disableCheckAll ? html`<mwc-formfield class="checkall"
          ><mwc-checkbox
            ?indeterminate=${!this.isAllSelected && this.isSomeSelected}
            ?checked=${this.isAllSelected}
            @change=${() => {
      this.onCheckAll();
    }}
          ></mwc-checkbox
        ></mwc-formfield>` : html``;
  }
  render() {
    return html`<div id="tfcontainer">
        <mwc-textfield
          label="${this.searchFieldLabel ?? ""}"
          iconTrailing="search"
          outlined
          @input=${() => this.onFilterInput()}
        ></mwc-textfield>
        ${this.renderCheckAll()}
      </div>
      ${super.render()}`;
  }
};
Filterlist.styles = css`
    ${List.styles}

    #tfcontainer {
      display: flex;
      flex: auto;
    }

    ::slotted(.hidden) {
      display: none;
    }

    mwc-textfield {
      margin: 10px;
      width: 100%;
      --mdc-shape-small: 28px;
    }

    mwc-formfield.checkall {
      padding-right: 8px;
    }

    .mdc-list {
      padding-inline-start: 0px;
    }
  `;
__decorate([
  property({type: String})
], Filterlist.prototype, "searchFieldLabel", 2);
__decorate([
  property({type: Boolean})
], Filterlist.prototype, "disableCheckAll", 2);
__decorate([
  internalProperty()
], Filterlist.prototype, "existCheckListItem", 1);
__decorate([
  internalProperty()
], Filterlist.prototype, "isAllSelected", 1);
__decorate([
  internalProperty()
], Filterlist.prototype, "isSomeSelected", 1);
__decorate([
  query("mwc-textfield")
], Filterlist.prototype, "searchField", 2);
Filterlist = __decorate([
  customElement("filtered-list")
], Filterlist);
