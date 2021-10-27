import { __decorate } from "../../../_snowpack/pkg/tslib.js";
import { LitElement, property } from '../../../_snowpack/pkg/lit-element.js';
import { get } from '../../../_snowpack/pkg/lit-translate.js';
import { newIssueEvent, newLogEvent, } from '../foundation.js';
import { validateChildren } from './templates/foundation.js';
export function dispatch(detail, validatorId) {
    const kind = detail.kind;
    const title = detail.title;
    const message = detail.message;
    if (kind)
        document
            .querySelector('open-scd')
            ?.dispatchEvent(newLogEvent(detail));
    else
        document.querySelector('open-scd')?.dispatchEvent(newIssueEvent({
            validatorId,
            title,
            message,
        }));
}
export default class ValidateTemplates extends LitElement {
    async validate() {
        const promises = [];
        const [version, revision, release] = [
            this.doc.documentElement.getAttribute('version') ?? '',
            this.doc.documentElement.getAttribute('revision') ?? '',
            this.doc.documentElement.getAttribute('release') ?? '',
        ];
        if (!(version === '2007' && revision === 'B' && Number(release) > 3)) {
            document.querySelector('open-scd')?.dispatchEvent(newIssueEvent({
                validatorId: this.pluginId,
                title: get('diag.missingnsd'),
                message: '',
            }));
            return;
        }
        const data = this.doc.querySelector('DataTypeTemplates');
        if (!data)
            return;
        const issuesTemaplte = await validateChildren(data);
        if (issuesTemaplte.length === 0)
            issuesTemaplte.push({
                title: get('diag.zeroissues'),
            });
        issuesTemaplte.forEach(error => dispatch(error, this.pluginId));
    }
}
__decorate([
    property({ attribute: false })
], ValidateTemplates.prototype, "doc", void 0);
__decorate([
    property()
], ValidateTemplates.prototype, "docName", void 0);
__decorate([
    property()
], ValidateTemplates.prototype, "pluginId", void 0);
//# sourceMappingURL=ValidateTemplates.js.map