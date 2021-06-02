import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { html, property, query } from '../../_snowpack/pkg/lit-element.js';
import { registerTranslateConfig, translate, use } from '../../_snowpack/pkg/lit-translate.js';
import { ifImplemented } from './foundation.js';
import { languages, loader } from './translations/loader.js';
export const defaults = { language: 'en', theme: 'light' };
export function Setting(Base) {
    class SettingElement extends Base {
        constructor(...params) {
            super(...params);
            registerTranslateConfig({ loader, empty: key => key });
            use(this.settings.language);
        }
        /** Current [[`Settings`]] in `localStorage`, default to [[`defaults`]]. */
        get settings() {
            return {
                language: this.getSetting('language'),
                theme: this.getSetting('theme'),
            };
        }
        getSetting(setting) {
            return (localStorage.getItem(setting) ?? defaults[setting]);
        }
        /** Update the `value` of `setting`, storing to `localStorage`. */
        setSetting(setting, value) {
            localStorage.setItem(setting, value);
            this.requestUpdate();
        }
        onClosing(ae) {
            if (ae.detail?.action === 'reset') {
                Object.keys(this.settings).forEach(item => localStorage.removeItem(item));
                this.requestUpdate('settings');
            }
            else if (ae.detail?.action === 'save') {
                this.setSetting('language', this.languageUI.value);
                this.setSetting('theme', this.darkThemeUI.checked ? 'dark' : 'light');
                this.requestUpdate('settings');
            }
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('settings'))
                use(this.settings.language);
        }
        render() {
            return html `${ifImplemented(super.render())}
        <mwc-dialog
          id="settings"
          heading="${translate('settings.name')}"
          @closing=${this.onClosing}
        >
          <form>
            <mwc-select
              naturalMenuWidth
              id="language"
              icon="language"
              label="${translate('settings.language')}"
            >
              ${Object.keys(languages).map(lang => html `<mwc-list-item
                    graphic="icon"
                    value="${lang}"
                    ?selected=${lang === this.settings.language}
                    >${translate(`settings.languages.${lang}`)}</mwc-list-item
                  >`)}
            </mwc-select>
            <mwc-formfield label="${translate('settings.dark')}">
              <mwc-switch
                id="dark"
                ?checked=${this.settings.theme === 'dark'}
              ></mwc-switch>
            </mwc-formfield>
          </form>
          <mwc-button slot="secondaryAction" dialogAction="close">
            ${translate('cancel')}
          </mwc-button>
          <mwc-button
            style="--mdc-theme-primary: var(--mdc-theme-error)"
            slot="secondaryAction"
            dialogAction="reset"
          >
            ${translate('reset')}
          </mwc-button>
          <mwc-button
            icon="save"
            trailingIcon
            slot="primaryAction"
            dialogAction="save"
          >
            ${translate('save')}
          </mwc-button>
        </mwc-dialog>`;
        }
    }
    __decorate([
        property()
    ], SettingElement.prototype, "settings", null);
    __decorate([
        query('#settings')
    ], SettingElement.prototype, "settingsUI", void 0);
    __decorate([
        query('#language')
    ], SettingElement.prototype, "languageUI", void 0);
    __decorate([
        query('#dark')
    ], SettingElement.prototype, "darkThemeUI", void 0);
    return SettingElement;
}
//# sourceMappingURL=Setting.js.map