import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { css, customElement, html, LitElement, property, query, } from '../../_snowpack/pkg/lit-element.js';
import { until } from '../../_snowpack/pkg/lit-html/directives/until.js';
import { translate } from '../../_snowpack/pkg/lit-translate.js';
const waitingList = html `<mwc-list
  ><mwc-list-item noninteractive hasMeta
    >${translate('loading')}<mwc-icon slot="meta"
      >pending</mwc-icon
    ></mwc-list-item
  ></mwc-list
>`;
let FinderPane = class FinderPane extends LitElement {
    constructor() {
        super(...arguments);
        this.path = [];
        this.getChildren = async () => {
            return { content: html ``, children: [] };
        };
        this.loaded = Promise.resolve();
    }
    async select(event, index) {
        this.path.splice(index + 1);
        const item = event.target.selected;
        if (!item.selected) {
            return;
        }
        this.path.push(item.text);
        this.requestUpdate();
        await this.updateComplete;
        await new Promise(resolve => setTimeout(resolve, 250));
        this.container.scrollLeft = 1000 * this.path.length;
    }
    async renderDirectory(parent, index) {
        const progeny = await this.getChildren(this.path.slice(0, index + 1));
        const children = progeny.children.map(child => html `<mwc-list-item ?activated=${this.path[index + 1] === child}
          >${child}</mwc-list-item
        >`);
        if (this.path.length > index + 1) {
            return html `<section>
        ${progeny.content}
        <mwc-list @selected=${(e) => this.select(e, index)}
          >${children}</mwc-list
        >
      </section>`;
        }
        else {
            return html `<section>
        ${progeny.content}
        ${children.length
                ? html `<filtered-list
              @selected=${(e) => this.select(e, index)}
              searchFieldLabel="${parent || '/'}"
              >${children}</filtered-list
            >`
                : html ``}
      </section>`;
        }
    }
    render() {
        const lists = this.path.map((parent, index) => this.renderDirectory(parent, index));
        this.loaded = Promise.allSettled(lists).then();
        return html `<div class="pane">
      ${lists.map(list => until(list, waitingList))}
    </div>`;
    }
};
FinderPane.styles = css `
    div.pane {
      display: flex;
      flex-direction: row;
      overflow: auto;
    }

    h2 {
      color: var(--mdc-theme-primary);
    }

    section {
      display: flex;
      flex-direction: column;
      width: max-content;
    }

    section > mwc-list {
      margin-top: 76px;
    }

    a {
      font-weight: 600;
      font-variant: small-caps;
      text-transform: lowercase;
      text-decoration: none;
      color: var(--mdc-theme-primary);
    }

    a:link {
      color: var(--mdc-theme-error);
    }

    a:visited {
      color: var(--mdc-theme-secondary);
    }
  `;
__decorate([
    property({ type: Array })
], FinderPane.prototype, "path", void 0);
__decorate([
    property({ attribute: false })
], FinderPane.prototype, "getChildren", void 0);
__decorate([
    property({ attribute: false })
], FinderPane.prototype, "loaded", void 0);
__decorate([
    query('div')
], FinderPane.prototype, "container", void 0);
FinderPane = __decorate([
    customElement('finder-pane')
], FinderPane);
export { FinderPane };
//# sourceMappingURL=finder-pane.js.map