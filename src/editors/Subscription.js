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
import "../../_snowpack/pkg/@material/mwc-fab.js";
import "./subscription/subscriber-ied-list-goose.js";
import "./subscription/publisher-goose-list.js";
export default class SubscriptionABBPlugin extends LitElement {
  render() {
    return html` <div class="container">
      <publisher-goose-list class="row" .doc=${this.doc}></publisher-goose-list>
      <subscriber-ied-list-goose
        class="row"
        .doc=${this.doc}
      ></subscriber-ied-list-goose>
    </div>`;
  }
}
SubscriptionABBPlugin.styles = css`
    :host {
      width: 100vw;
    }

    .container {
      display: flex;
      padding: 8px 6px 16px;
      height: 86vh;
    }

    .row {
      flex: 50%;
      margin: 0px 6px 0px;
      min-width: 300px;
      height: 100%;
      overflow-y: scroll;
    }
  `;
__decorate([
  property()
], SubscriptionABBPlugin.prototype, "doc", 2);
