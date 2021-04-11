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
import {
  css,
  customElement,
  html,
  property,
  query
} from "../_snowpack/pkg/lit-element.js";
export let Filterlist = class extends List {
  onFilterInput() {
    this.items.forEach((item) => {
      const text = (item.innerText + "\n" + Array.from(item.children).map((child) => child.innerText).join("\n")).toUpperCase();
      const terms = this.searchField.value.toUpperCase().split(" ");
      terms.some((term) => !text.includes(term)) ? item.classList.add("hidden") : item.classList.remove("hidden");
    });
  }
  render() {
    return html`<div id="tfcontainer">
        <mwc-textfield
          label="${this.searchFieldLabel ?? ""}"
          iconTrailing="search"
          outlined
          @input=${() => this.onFilterInput()}
        ></mwc-textfield>
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

    .mdc-list {
      padding-inline-start: 0px;
    }
  `;
__decorate([
  property()
], Filterlist.prototype, "searchFieldLabel", 2);
__decorate([
  query("mwc-textfield")
], Filterlist.prototype, "searchField", 2);
Filterlist = __decorate([
  customElement("filtered-list")
], Filterlist);
