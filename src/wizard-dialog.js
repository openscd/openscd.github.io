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
  html
} from "../_snowpack/pkg/lit-element.js";
import {translate} from "../_snowpack/pkg/lit-translate.js";
import {Dialog} from "../_snowpack/pkg/@material/mwc-dialog.js";
import "./wizard-textfield.js";
import {
  newActionEvent,
  newWizardEvent,
  wizardInputSelector
} from "./foundation.js";
function dialogInputs(dialog) {
  return Array.from(dialog?.querySelectorAll(wizardInputSelector) ?? []);
}
function dialogValid(dialog) {
  return dialogInputs(dialog).every((wi) => wi.checkValidity());
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
  checkValidity() {
    return Array.from(this.inputs).every((wi) => wi.checkValidity());
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
      dialogInputs(this.dialog).map((wi) => wi.reportValidity());
    }
  }
  async act(action) {
    if (action === void 0)
      return false;
    const inputArray = Array.from(this.inputs);
    if (!this.checkValidity()) {
      this.pageIndex = this.firstInvalidPage;
      inputArray.map((wi) => wi.reportValidity());
      return false;
    }
    const editorActions = action(inputArray, this);
    editorActions.forEach((ea) => this.dispatchEvent(newActionEvent(ea)));
    if (editorActions.length > 0)
      this.dispatchEvent(newWizardEvent());
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
      this.dialog?.show();
      this.pageIndex = 0;
    }
  }
  renderPage(page, index) {
    return html`<mwc-dialog
      defaultAction="close"
      ?open=${index === this.pageIndex}
      heading=${page.title}
      @closed=${this.onClosed}
    >
      <div id="wizard-content">${page.content}</div>
      ${index > 0 ? html`<mwc-button
            slot="secondaryAction"
            dialogAction="prev"
            icon="navigate_before"
            label=${this.wizard?.[index - 1].title}
          ></mwc-button>` : html``}
      ${page.secondary ? html`<mwc-button
            slot="secondaryAction"
            @click=${() => this.act(page.secondary?.action)}
            icon="${page.secondary.icon}"
            label="${page.secondary.label}"
          ></mwc-button>` : html`<mwc-button
            slot="secondaryAction"
            dialogAction="close"
            label="${translate("cancel")}"
            style="--mdc-theme-primary: var(--mdc-theme-error)"
          ></mwc-button>`}
      ${page.primary ? html`<mwc-button
            slot="primaryAction"
            @click=${() => this.act(page.primary?.action)}
            icon="${page.primary.icon}"
            label="${page.primary.label}"
            trailingIcon
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
  property()
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
WizardDialog = __decorate([
  customElement("wizard-dialog")
], WizardDialog);
