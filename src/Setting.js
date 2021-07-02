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
import {html, property, query} from "../_snowpack/pkg/lit-element.js";
import {registerTranslateConfig, translate, use} from "../_snowpack/pkg/lit-translate.js";
import {ifImplemented} from "./foundation.js";
import {languages, loader} from "./translations/loader.js";
export const defaults = {language: "en", theme: "light"};
export function Setting(Base) {
  class SettingElement extends Base {
    get settings() {
      return {
        language: this.getSetting("language"),
        theme: this.getSetting("theme")
      };
    }
    getSetting(setting) {
      return localStorage.getItem(setting) ?? defaults[setting];
    }
    setSetting(setting, value) {
      localStorage.setItem(setting, value);
      this.requestUpdate();
    }
    onClosing(ae) {
      if (ae.detail?.action === "reset") {
        Object.keys(this.settings).forEach((item) => localStorage.removeItem(item));
        this.requestUpdate("settings");
      } else if (ae.detail?.action === "save") {
        this.setSetting("language", this.languageUI.value);
        this.setSetting("theme", this.darkThemeUI.checked ? "dark" : "light");
        this.requestUpdate("settings");
      }
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has("settings"))
        use(this.settings.language);
    }
    constructor(...params) {
      super(...params);
      registerTranslateConfig({loader, empty: (key) => key});
      use(this.settings.language);
    }
    render() {
      return html`${ifImplemented(super.render())}
        <mwc-dialog
          id="settings"
          heading="${translate("settings.title")}"
          @closing=${this.onClosing}
        >
          <form>
            <mwc-select
              naturalMenuWidth
              id="language"
              icon="language"
              label="${translate("settings.language")}"
            >
              ${Object.keys(languages).map((lang) => html`<mwc-list-item
                    graphic="icon"
                    value="${lang}"
                    ?selected=${lang === this.settings.language}
                    >${translate(`settings.languages.${lang}`)}</mwc-list-item
                  >`)}
            </mwc-select>
            <mwc-formfield label="${translate("settings.dark")}">
              <mwc-switch
                id="dark"
                ?checked=${this.settings.theme === "dark"}
              ></mwc-switch>
            </mwc-formfield>
          </form>
          <mwc-button slot="secondaryAction" dialogAction="close">
            ${translate("cancel")}
          </mwc-button>
          <mwc-button
            style="--mdc-theme-primary: var(--mdc-theme-error)"
            slot="secondaryAction"
            dialogAction="reset"
          >
            ${translate("reset")}
          </mwc-button>
          <mwc-button
            icon="save"
            trailingIcon
            slot="primaryAction"
            dialogAction="save"
          >
            ${translate("save")}
          </mwc-button>
        </mwc-dialog>`;
    }
  }
  __decorate([
    property()
  ], SettingElement.prototype, "settings", 1);
  __decorate([
    query("#settings")
  ], SettingElement.prototype, "settingsUI", 2);
  __decorate([
    query("#language")
  ], SettingElement.prototype, "languageUI", 2);
  __decorate([
    query("#dark")
  ], SettingElement.prototype, "darkThemeUI", 2);
  return SettingElement;
}
