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
import "./sampledvalues/subscriber-ied-list.js";
import "./sampledvalues/sampled-values-list.js";
export default class SampledValuesPlugin extends LitElement {
  render() {
    return html`
    <div id="containerTemplates">
      <section>
        <sampled-values-list .doc=${this.doc}></sampled-values-list>
      </section>
      <section>
        <subscriber-ied-list .doc=${this.doc}></subscriber-ied-list>
      </section>
    </div>`;
  }
}
SampledValuesPlugin.styles = css`
    :host {
      width: 100vw;
    }

    section {
      width: 49vw;
    }

    #containerTemplates {
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #containerTemplates {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
__decorate([
  property()
], SampledValuesPlugin.prototype, "doc", 2);
