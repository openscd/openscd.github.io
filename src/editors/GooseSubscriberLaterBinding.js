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
import {LitElement, property, html, css} from "../../_snowpack/pkg/lit-element.js";
import "./subscription/later-binding/fcda-later-binding-list.js";
export default class GooseSubscribeLaterBindingPlugin extends LitElement {
  render() {
    return html`<div>
      <div class="container">
        <fcda-later-binding-list .doc=${this.doc} controlTag="GSEControl">
        </fcda-later-binding-list>
      </div>
    </div>`;
  }
}
GooseSubscribeLaterBindingPlugin.styles = css`
    :host {
      width: 100vw;
    }

    .container {
      padding: 8px 6px 16px;
    }
  `;
__decorate([
  property({attribute: false})
], GooseSubscribeLaterBindingPlugin.prototype, "doc", 2);
