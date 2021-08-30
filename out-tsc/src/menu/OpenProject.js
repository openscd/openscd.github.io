import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { css, html, LitElement, query } from '../../../_snowpack/pkg/lit-element.js';
import { newLogEvent, newOpenDocEvent } from '../foundation.js';
export default class OpenProjectPlugin extends LitElement {
    async openDoc(event) {
        const file = event.target?.files?.item(0) ?? false;
        if (!file)
            return;
        const text = await file.text();
        const docName = file.name;
        const doc = new DOMParser().parseFromString(text, 'application/xml');
        document
            .querySelector('open-scd')
            .dispatchEvent(newLogEvent({ kind: 'reset' }));
        document
            .querySelector('open-scd')
            .dispatchEvent(newOpenDocEvent(doc, docName));
        this.pluginFileUI.onchange = null;
    }
    async run() {
        this.pluginFileUI.click();
    }
    render() {
        return html `<input @click=${(event) => (event.target.value = '')} @change=${this.openDoc} id="open-plugin-input" accept=".sed,.scd,.ssd,.iid,.cid,.icd" type="file"></input>`;
    }
}
OpenProjectPlugin.styles = css `
    input {
      width: 0;
      height: 0;
      opacity: 0;
    }
  `;
__decorate([
    query('#open-plugin-input')
], OpenProjectPlugin.prototype, "pluginFileUI", void 0);
//# sourceMappingURL=OpenProject.js.map