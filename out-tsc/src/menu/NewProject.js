import { html, LitElement } from '../../../_snowpack/pkg/lit-element.js';
import { get } from '../../../_snowpack/pkg/lit-translate.js';
import { newLogEvent, newOpenDocEvent, newWizardEvent, } from '../foundation.js';
import { newEmptySCD } from '../schemas.js';
export default class NewProjectPlugin extends LitElement {
    createNewProject(inputs, wizard) {
        const docName = inputs[0].value?.match(/\.s[sc]d$/i)
            ? inputs[0].value
            : inputs[0].value + '.scd';
        const version = (wizard.shadowRoot.querySelector('mwc-list').selected
            .value);
        document
            .querySelector('open-scd')
            ?.dispatchEvent(newLogEvent({ kind: 'reset' }));
        document
            .querySelector('open-scd')
            ?.dispatchEvent(newOpenDocEvent(newEmptySCD(docName.slice(0, -4), version), docName));
        return [{ actions: [], title: '', derived: true }];
    }
    newProjectWizard() {
        return [
            {
                title: get('menu.new'),
                primary: {
                    icon: 'create_new_folder',
                    label: get('create'),
                    action: (inputs, wizard) => this.createNewProject(inputs, wizard),
                },
                content: [
                    html `<wizard-textfield
              id="srcName"
              label="name"
              value="project.scd"
              required
              dialogInitialFocus
            ></wizard-textfield>
            <mwc-list activatable>
              <mwc-radio-list-item left value="2003"
                >Edition 1 (Schema 1.7)</mwc-radio-list-item
              >
              <mwc-radio-list-item left value="2007B"
                >Edition 2 (Schema 3.1)</mwc-radio-list-item
              >
              <mwc-radio-list-item left selected value="2007B4"
                >Edition 2.1 (2007B4)</mwc-radio-list-item
              >
            </mwc-list>`,
                ],
            },
        ];
    }
    async run() {
        document
            .querySelector('open-scd')
            ?.dispatchEvent(newWizardEvent(this.newProjectWizard()));
    }
}
//# sourceMappingURL=NewProject.js.map