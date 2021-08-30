import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, html, LitElement, query } from '../../../_snowpack/pkg/lit-element.js';
import { newWizardEvent } from '../foundation.js';
import { mergeWizard } from '../wizards.js';
export default class MergePlugin extends LitElement {
    mergeDoc(event) {
        const file = event.target?.files?.item(0) ?? false;
        if (file)
            file.text().then(text => {
                const doc = new DOMParser().parseFromString(text, 'application/xml');
                // FIXME: Dirty hack should not be necessary!
                document
                    .querySelector('open-scd')
                    .dispatchEvent(newWizardEvent(mergeWizard(this.doc.documentElement, doc.documentElement)));
            });
        this.pluginFileUI.onchange = null;
    }
    async run() {
        this.pluginFileUI.click();
    }
    render() {
        return html `<input @click=${(event) => (event.target.value = '')} @change=${this.mergeDoc} id="merge-plugin-input" accept=".sed,.scd,.ssd,.iid,.cid,.icd" type="file"></input>`;
    }
}
MergePlugin.styles = css `
    input {
      width: 0;
      height: 0;
      opacity: 0;
    }
  `;
__decorate([
    query('#merge-plugin-input')
], MergePlugin.prototype, "pluginFileUI", void 0);
//# sourceMappingURL=Merge.js.map