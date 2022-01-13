import {html} from "../../_snowpack/pkg/lit-element.js";
import {get} from "../../_snowpack/pkg/lit-translate.js";
import {identity, isPublic} from "../foundation.js";
export function selectSampledValueControlWizard(element) {
  const smvControls = Array.from(element.querySelectorAll("SampledValueControl")).filter(isPublic);
  return [
    {
      title: get("wizard.title.select", {tagName: "SampledValueControl"}),
      content: [
        html`<filtered-list
          >${smvControls.map((smvControl) => html`<mwc-list-item twoline value="${identity(smvControl)}"
                ><span>${smvControl.getAttribute("name")}</span
                ><span slot="secondary"
                  >${identity(smvControl)}</span
                ></mwc-list-item
              >`)}</filtered-list
        >`
      ]
    }
  ];
}
