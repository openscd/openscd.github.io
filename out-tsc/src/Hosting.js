import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { html, property, query } from '../../_snowpack/pkg/lit-element.js';
import { until } from '../../_snowpack/pkg/lit-html/directives/until.js';
import { translate } from '../../_snowpack/pkg/lit-translate.js';
import { newPendingStateEvent } from './foundation.js';
import { pluginIcons } from './Plugging.js';
export function Hosting(Base) {
    class HostingElement extends Base {
        constructor(...args) {
            super(...args);
            /** The currently active editor tab. */
            this.activeTab = 0;
            this.validated = Promise.resolve();
            this.shouldValidate = false;
            this.addEventListener('validate', async () => {
                this.shouldValidate = true;
                await this.validated;
                if (!this.shouldValidate)
                    return;
                this.diagnoses.clear();
                this.shouldValidate = false;
                this.validated = Promise.allSettled(this.menuUI
                    .querySelector('mwc-list')
                    .items.filter(item => item.className === 'validator')
                    .map(item => item.lastElementChild.validate())).then();
                this.dispatchEvent(newPendingStateEvent(this.validated));
            });
        }
        get menu() {
            const topMenu = [];
            const middleMenu = [];
            const bottomMenu = [];
            const validators = [];
            this.topMenu.forEach(plugin => topMenu.push({
                icon: plugin.icon || pluginIcons['menu'],
                name: plugin.name,
                action: ae => {
                    this.dispatchEvent(newPendingStateEvent((ae.target.items[ae.detail.index].lastElementChild).run()));
                },
                disabled: () => plugin.requireDoc && this.doc === null,
                content: plugin.content,
                kind: 'top',
            }));
            this.middleMenu.forEach(plugin => middleMenu.push({
                icon: plugin.icon || pluginIcons['menu'],
                name: plugin.name,
                action: ae => {
                    this.dispatchEvent(newPendingStateEvent((ae.target.items[ae.detail.index].lastElementChild).run()));
                },
                disabled: () => plugin.requireDoc && this.doc === null,
                content: plugin.content,
                kind: 'middle',
            }));
            this.bottomMenu.forEach(plugin => bottomMenu.push({
                icon: plugin.icon || pluginIcons['menu'],
                name: plugin.name,
                action: ae => {
                    this.dispatchEvent(newPendingStateEvent((ae.target.items[ae.detail.index].lastElementChild).run()));
                },
                disabled: () => plugin.requireDoc && this.doc === null,
                content: plugin.content,
                kind: 'middle',
            }));
            this.validators.forEach(plugin => validators.push({
                icon: plugin.icon || pluginIcons['validator'],
                name: plugin.name,
                action: ae => {
                    if (this.diagnoses.get(plugin.src))
                        this.diagnoses.get(plugin.src).length = 0;
                    this.dispatchEvent(newPendingStateEvent((ae.target.items[ae.detail.index].lastElementChild).validate()));
                },
                disabled: () => this.doc === null,
                content: plugin.content,
                kind: 'validator',
            }));
            if (middleMenu.length > 0)
                middleMenu.push('divider');
            if (bottomMenu.length > 0)
                bottomMenu.push('divider');
            return [
                'divider',
                ...topMenu,
                'divider',
                {
                    icon: 'undo',
                    name: 'undo',
                    actionItem: true,
                    action: this.undo,
                    disabled: () => !this.canUndo,
                    kind: 'static',
                },
                {
                    icon: 'redo',
                    name: 'redo',
                    actionItem: true,
                    action: this.redo,
                    disabled: () => !this.canRedo,
                    kind: 'static',
                },
                ...validators,
                {
                    icon: 'history',
                    name: 'menu.viewLog',
                    actionItem: true,
                    action: () => this.logUI.show(),
                    kind: 'static',
                },
                {
                    icon: 'rule',
                    name: 'menu.viewDiag',
                    actionItem: true,
                    action: () => this.diagnosticUI.show(),
                    kind: 'static',
                },
                'divider',
                ...middleMenu,
                {
                    icon: 'settings',
                    name: 'settings.title',
                    action: () => this.settingsUI.show(),
                    kind: 'static',
                },
                ...bottomMenu,
                {
                    icon: 'extension',
                    name: 'plugins.heading',
                    action: () => this.pluginUI.show(),
                    kind: 'static',
                },
            ];
        }
        renderMenuItem(me) {
            if (me === 'divider')
                return html `<li divider padded role="separator"></li>`;
            return html `
        <mwc-list-item
          class="${me.kind}"
          iconid="${me.icon}"
          graphic="icon"
          .disabled=${me.disabled?.() || !me.action}
          ><mwc-icon slot="graphic">${me.icon}</mwc-icon>
          <span>${translate(me.name)}</span>
          ${me.hint
                ? html `<span slot="secondary"><tt>${me.hint}</tt></span>`
                : ''}
          ${me.content
                ? until(me.content(), html `<mwc-linear-progress indeterminate></mwc-linear-progress>`)
                : ''}
        </mwc-list-item>
      `;
        }
        renderActionItem(me) {
            if (me !== 'divider' && me.actionItem)
                return html `<mwc-icon-button
          slot="actionItems"
          icon="${me.icon}"
          label="${me.name}"
          ?disabled=${me.disabled?.() || !me.action}
          @click=${me.action}
        ></mwc-icon-button>`;
            else
                return html ``;
        }
        renderEditorTab({ name, icon }) {
            return html `<mwc-tab label=${translate(name)} icon=${icon || 'edit'}>
      </mwc-tab>`;
        }
        render() {
            return html ` <mwc-drawer
          class="mdc-theme--surface"
          hasheader
          type="modal"
          id="menu"
        >
          <span slot="title">${translate('menu.title')}</span>
          ${this.docName
                ? html `<span slot="subtitle">${this.docName}</span>`
                : ''}
          <mwc-list
            wrapFocus
            @action=${(ae) => (this.menu.filter(item => item !== 'divider')[ae.detail.index])?.action?.(ae)}
          >
            ${this.menu.map(this.renderMenuItem)}
          </mwc-list>

          <mwc-top-app-bar-fixed slot="appContent">
            <mwc-icon-button
              icon="menu"
              label="Menu"
              slot="navigationIcon"
              @click=${() => (this.menuUI.open = true)}
            ></mwc-icon-button>
            <div slot="title" id="title">${this.docName}</div>
            ${this.menu.map(this.renderActionItem)}
            ${this.doc
                ? html `<mwc-tab-bar
                  @MDCTabBar:activated=${(e) => (this.activeTab = e.detail.index)}
                >
                  ${this.editors.map(this.renderEditorTab)}
                </mwc-tab-bar>`
                : ``}
          </mwc-top-app-bar-fixed>
        </mwc-drawer>

        ${this.doc
                ? until(this.editors[this.activeTab] &&
                    this.editors[this.activeTab].content(), html `<mwc-linear-progress indeterminate></mwc-linear-progress>`)
                : html `<div class="landing">
              ${this.menu.filter(mi => mi !== 'divider').map((mi, index) => mi.kind === 'top' && !mi.disabled?.()
                    ? html `
                        <mwc-icon-button
                          class="landing_icon"
                          icon="${mi.icon}"
                          @click="${() => (this.menuUI.querySelector('mwc-list').items[index]).click()}"
                        >
                          <div class="landing_label">${mi.name}</div>
                        </mwc-icon-button>
                      `
                    : html ``)}
            </div>`}
        ${super.render()}`;
        }
    }
    __decorate([
        property({ type: Number })
    ], HostingElement.prototype, "activeTab", void 0);
    __decorate([
        property({ attribute: false })
    ], HostingElement.prototype, "validated", void 0);
    __decorate([
        query('#menu')
    ], HostingElement.prototype, "menuUI", void 0);
    return HostingElement;
}
//# sourceMappingURL=Hosting.js.map