import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { List } from '../../_snowpack/pkg/@material/mwc-list.js';
import { CheckListItem } from '../../_snowpack/pkg/@material/mwc-list/mwc-check-list-item.js';
import { ListBase } from '../../_snowpack/pkg/@material/mwc-list/mwc-list-base.js';
import { css, customElement, html, internalProperty, property, query, unsafeCSS, } from '../../_snowpack/pkg/lit-element.js';
let FilteredList = class FilteredList extends ListBase {
    constructor() {
        super();
        this.disableCheckAll = false;
        this.addEventListener('selected', () => {
            this.requestUpdate();
        });
    }
    get existCheckListItem() {
        return this.items.some(item => item instanceof CheckListItem);
    }
    get isAllSelected() {
        return this.items
            .filter(item => !item.disabled)
            .filter(item => item instanceof CheckListItem)
            .every(checkItem => checkItem.selected);
    }
    get isSomeSelected() {
        return this.items
            .filter(item => !item.disabled)
            .filter(item => item instanceof CheckListItem)
            .some(checkItem => checkItem.selected);
    }
    onCheckAll() {
        const select = !this.isAllSelected;
        this.items
            .filter(item => !item.disabled && !item.classList.contains('hidden'))
            .forEach(item => (item.selected = select));
    }
    onFilterInput() {
        this.items.forEach(item => {
            const text = (item.innerText +
                '\n' +
                Array.from(item.children)
                    .map(child => child.innerText)
                    .join('\n')).toUpperCase();
            const terms = this.searchField.value.toUpperCase().split(' ');
            terms.some(term => !text.includes(term))
                ? item.classList.add('hidden')
                : item.classList.remove('hidden');
        });
    }
    onListItemConnected(e) {
        super.onListItemConnected(e);
        this.requestUpdate();
    }
    renderCheckAll() {
        return this.existCheckListItem && !this.disableCheckAll
            ? html `<mwc-formfield class="checkall"
          ><mwc-checkbox
            ?indeterminate=${!this.isAllSelected && this.isSomeSelected}
            ?checked=${this.isAllSelected}
            @change=${() => {
                this.onCheckAll();
            }}
          ></mwc-checkbox
        ></mwc-formfield>`
            : html ``;
    }
    render() {
        return html `<div id="tfcontainer">
        <mwc-textfield
          label="${this.searchFieldLabel ?? ''}"
          iconTrailing="search"
          outlined
          @input=${() => this.onFilterInput()}
        ></mwc-textfield>
        ${this.renderCheckAll()}
      </div>
      ${super.render()}`;
    }
};
FilteredList.styles = css `
    ${unsafeCSS(List.styles)}

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
    property({ type: String })
], FilteredList.prototype, "searchFieldLabel", void 0);
__decorate([
    property({ type: Boolean })
], FilteredList.prototype, "disableCheckAll", void 0);
__decorate([
    internalProperty()
], FilteredList.prototype, "existCheckListItem", null);
__decorate([
    internalProperty()
], FilteredList.prototype, "isAllSelected", null);
__decorate([
    internalProperty()
], FilteredList.prototype, "isSomeSelected", null);
__decorate([
    query('mwc-textfield')
], FilteredList.prototype, "searchField", void 0);
FilteredList = __decorate([
    customElement('filtered-list')
], FilteredList);
export { FilteredList };
//# sourceMappingURL=filtered-list.js.map