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
import {property} from "../web_modules/lit-element.js";
import {get} from "../web_modules/lit-translate.js";
import {newLogEvent} from "./foundation.js";
import {
  getSchema,
  isLoadSchemaResult,
  isValidationError,
  isValidationResult
} from "./schemas.js";
const validators = {};
export function Validating(Base) {
  class ValidatingElement extends Base {
    constructor() {
      super(...arguments);
      this.validated = Promise.resolve({
        file: "untitled.scd",
        valid: true,
        code: 0
      });
    }
    async validate(doc, {
      version = "2007",
      revision = "B",
      release = "1",
      fileName = "untitled.scd"
    } = {}) {
      this.validated = this.getValidator(getSchema(version, revision, release), "SCL" + version + revision + release + ".xsd").then((validator) => validator(new XMLSerializer().serializeToString(doc), fileName));
      return this.validated;
    }
    async getValidator(xsd, xsdName) {
      if (!window.Worker)
        throw new Error(get("validating.fatal"));
      if (validators[xsdName])
        return validators[xsdName];
      const worker = window.__karma__ ? new Worker("/base/public/js/worker.js") : new Worker("public/js/worker.js");
      async function validate(xml, xmlName) {
        return new Promise((resolve) => {
          worker.addEventListener("message", (e) => {
            if (isValidationResult(e.data) && e.data.file === xmlName)
              resolve(e.data);
          });
          worker.postMessage({content: xml, name: xmlName});
        });
      }
      return new Promise((resolve, reject) => {
        worker.addEventListener("message", (e) => {
          if (isLoadSchemaResult(e.data)) {
            if (e.data.loaded)
              resolve(validate);
            else
              reject(get("validating.loadEror", {name: e.data.file}));
          } else if (isValidationError(e.data)) {
            const parts = e.data.message.split(": ", 2);
            const description = parts[1] ? parts[1] : parts[0];
            const qualifiedTag = parts[1] ? " (" + parts[0] + ")" : "";
            this.dispatchEvent(newLogEvent({
              title: description,
              kind: e.data.level > 1 ? "error" : "warning",
              message: e.data.file + ":" + e.data.line + " " + e.data.node + " " + e.data.part + qualifiedTag
            }));
          } else if (isValidationResult(e.data)) {
            this.dispatchEvent(newLogEvent({
              title: get(e.data.valid ? "validating.valid" : "validating.invalid", {name: e.data.file}),
              kind: e.data.valid ? "info" : "warning"
            }));
          } else {
            this.dispatchEvent(newLogEvent({
              title: get("validating.fatal"),
              kind: "error",
              message: e.data
            }));
          }
        });
        worker.postMessage({content: xsd, name: xsdName});
      });
    }
  }
  __decorate([
    property()
  ], ValidatingElement.prototype, "validated", 2);
  return ValidatingElement;
}
