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
import {
  customElement,
  css,
  queryAll,
  LitElement,
  property,
  internalProperty,
  html,
  query
} from "../_snowpack/pkg/lit-element.js";
import {get, translate} from "../_snowpack/pkg/lit-translate.js";
import "../_snowpack/pkg/@material/mwc-button.js";
import "../_snowpack/pkg/@material/mwc-dialog.js";
import "../_snowpack/pkg/@material/mwc-icon-button.js";
import "../_snowpack/pkg/@material/mwc-icon-button-toggle.js";
import "../_snowpack/pkg/@material/mwc-menu.js";
import {Dialog} from "../_snowpack/pkg/@material/mwc-dialog.js";
import "../_snowpack/pkg/ace-custom-element.js";
import {
  newActionEvent,
  newWizardEvent,
  wizardInputSelector,
  isWizardFactory,
  checkValidity,
  reportValidity,
  identity,
  newSubWizardEvent
} from "./foundation.js";
function dialogInputs(dialog) {
  return Array.from(dialog?.querySelectorAll(wizardInputSelector) ?? []);
}
function dialogValid(dialog) {
  return dialogInputs(dialog).every(checkValidity);
}
function codeAction(element) {
  return (inputs) => {
    const text = inputs[0].value;
    if (!text || !element.parentElement)
      return [];
    const desc = {
      parent: element.parentElement,
      reference: element.nextSibling,
      element
    };
    const del = {
      old: desc,
      checkValidity: () => true
    };
    const cre = {
      new: {
        ...desc,
        element: new DOMParser().parseFromString(text, "application/xml").documentElement
      },
      checkValidity: () => true
    };
    return [
      {
        actions: [del, cre],
        title: get("code.log", {
          id: identity(element)
        })
      }
    ];
  };
}
export let WizardDialog = class extends LitElement {
  constructor() {
    super();
    this.wizard = [];
    this.pageIndex = 0;
    this.act = this.act.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }
  get dialog() {
    return this.dialogs[this.pageIndex];
  }
  get code() {
    return (this.dialog?.querySelector("mwc-icon-button-toggle")?.on ?? false) && localStorage.getItem("mode") === "pro";
  }
  checkValidity() {
    return Array.from(this.inputs).every(checkValidity);
  }
  get firstInvalidPage() {
    return Array.from(this.dialogs).findIndex((dialog) => !dialogValid(dialog));
  }
  prev() {
    if (this.pageIndex > 0)
      this.pageIndex--;
  }
  async next() {
    if (dialogValid(this.dialog)) {
      if (this.wizard.length > this.pageIndex + 1)
        this.pageIndex++;
    } else {
      this.dialog?.show();
      await this.dialog?.updateComplete;
      dialogInputs(this.dialog).map(reportValidity);
    }
  }
  async act(action, primary = true) {
    if (action === void 0)
      return false;
    const wizardInputs = Array.from(this.inputs);
    const wizardList = this.dialog?.querySelector("filtered-list,mwc-list");
    if (!this.checkValidity()) {
      this.pageIndex = this.firstInvalidPage;
      wizardInputs.map(reportValidity);
      return false;
    }
    const wizardActions = action(wizardInputs, this, wizardList);
    if (wizardActions.length > 0) {
      if (primary)
        this.wizard[this.pageIndex].primary = void 0;
      else
        this.wizard[this.pageIndex].secondary = void 0;
      this.dispatchEvent(newWizardEvent());
    }
    wizardActions.forEach((wa) => isWizardFactory(wa) ? this.dispatchEvent(newWizardEvent(wa)) : this.dispatchEvent(newActionEvent(wa)));
    return true;
  }
  async menuAct(action) {
    if (!action)
      return false;
    const wizardActions = action();
    wizardActions.forEach((wa) => isWizardFactory(wa) ? this.dispatchEvent(newSubWizardEvent(wa)) : this.dispatchEvent(newActionEvent(wa)));
    return true;
  }
  onClosed(ae) {
    if (!(ae.target instanceof Dialog && ae.detail?.action))
      return;
    if (ae.detail.action === "close")
      this.dispatchEvent(newWizardEvent());
    else if (ae.detail.action === "prev")
      this.prev();
    else if (ae.detail.action === "next")
      this.next();
  }
  updated(changedProperties) {
    if (changedProperties.has("wizard")) {
      this.pageIndex = 0;
      while (this.wizard.findIndex((page) => page.initial) > this.pageIndex && dialogValid(this.dialog)) {
        this.dialog?.close();
        this.next();
      }
      this.dialog?.show();
    }
    if (this.wizard[this.pageIndex]?.primary?.auto) {
      this.updateComplete.then(() => this.act(this.wizard[this.pageIndex].primary.action));
    }
    if (this.actionsMenu)
      this.actionsMenu.anchor = this.menuButton;
  }
  renderMenu(page) {
    const someIconsDefined = page.menuActions?.some((menuAction) => menuAction.icon);
    return html` <mwc-icon-button
        icon="more_vert"
        @click=${() => {
      if (!this.actionsMenu.open)
        this.actionsMenu.show();
      else
        this.actionsMenu.close();
    }}
      ></mwc-icon-button>
      <mwc-menu class="actions-menu" corner="BOTTOM_RIGHT" menuCorner="END">
        ${page.menuActions.map((menuAction) => html`<mwc-list-item
              .graphic=${someIconsDefined ? "icon" : null}
              @click=${() => this.menuAct(menuAction.action)}
            >
              <span>${menuAction.label}</span>
              ${menuAction.icon ? html`<mwc-icon slot="graphic">${menuAction.icon}</mwc-icon>` : html``}
            </mwc-list-item>`)}
      </mwc-menu>`;
  }
  renderPage(page, index) {
    const showCodeToggleButton = page.element && localStorage.getItem("mode") === "pro";
    return html`<mwc-dialog
      defaultAction="close"
      ?open=${index === this.pageIndex}
      heading=${page.title}
      @closed=${this.onClosed}
    >
      ${showCodeToggleButton || page.menuActions ? html`<nav>
            ${showCodeToggleButton ? html`<mwc-icon-button-toggle
                  onicon="code"
                  officon="code_off"
                  @click=${() => this.requestUpdate()}
                ></mwc-icon-button-toggle>` : ""}
            ${page.menuActions ? this.renderMenu(page) : ""}
          </nav>` : ""}
      <div id="wizard-content">
        ${this.code && page.element ? html`<ace-editor
              base-path="/public/ace"
              wrap
              soft-tabs
              style="width: 80vw; height: calc(100vh - 240px);"
              theme="ace/theme/solarized_${localStorage.getItem("theme")}"
              mode="ace/mode/xml"
              value="${new XMLSerializer().serializeToString(page.element)}"
            ></ace-editor>` : page.content}
      </div>
      ${index > 0 ? html`<mwc-button
            slot="secondaryAction"
            dialogAction="prev"
            icon="navigate_before"
            label=${this.wizard?.[index - 1].title}
          ></mwc-button>` : html``}
      ${page.secondary ? html`<mwc-button
            slot="secondaryAction"
            @click=${() => this.act(page.secondary?.action, false)}
            icon="${page.secondary.icon}"
            label="${page.secondary.label}"
          ></mwc-button>` : html`<mwc-button
            slot="secondaryAction"
            dialogAction="close"
            label="${translate("cancel")}"
            style="--mdc-theme-primary: var(--mdc-theme-error)"
          ></mwc-button>`}
      ${this.code && page.element ? html`<mwc-button
            slot="primaryAction"
            @click=${() => this.act(codeAction(page.element))}
            icon="code"
            label="${translate("save")}"
            trailingIcon
            dialogInitialFocus
          ></mwc-button>` : page.primary ? html`<mwc-button
            slot="primaryAction"
            @click=${() => this.act(page.primary?.action)}
            icon="${page.primary.icon}"
            label="${page.primary.label}"
            trailingIcon
            dialogInitialFocus
          ></mwc-button>` : index + 1 < (this.wizard?.length ?? 0) ? html`<mwc-button
            slot="primaryAction"
            dialogAction="next"
            icon="navigate_next"
            label=${this.wizard?.[index + 1].title}
            trailingicon
          ></mwc-button>` : html``}
    </mwc-dialog>`;
  }
  render() {
    return html`${this.wizard.map(this.renderPage)}`;
  }
};
WizardDialog.styles = css`
    mwc-dialog {
      --mdc-dialog-max-width: 92vw;
    }

    mwc-dialog > nav {
      position: absolute;
      top: 8px;
      right: 14px;
      color: var(--base00);
    }

    mwc-dialog > nav > mwc-icon-button-toggle[on] {
      color: var(--mdc-theme-primary);
    }

    #wizard-content {
      display: flex;
      flex-direction: column;
    }

    #wizard-content > * {
      display: block;
      margin-top: 16px;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }
  `;
__decorate([
  property({type: Array})
], WizardDialog.prototype, "wizard", 2);
__decorate([
  internalProperty()
], WizardDialog.prototype, "pageIndex", 2);
__decorate([
  queryAll("mwc-dialog")
], WizardDialog.prototype, "dialogs", 2);
__decorate([
  queryAll(wizardInputSelector)
], WizardDialog.prototype, "inputs", 2);
__decorate([
  query(".actions-menu")
], WizardDialog.prototype, "actionsMenu", 2);
__decorate([
  query('mwc-icon-button[icon="more_vert"]')
], WizardDialog.prototype, "menuButton", 2);
WizardDialog = __decorate([
  customElement("wizard-dialog")
], WizardDialog);
