export async function plugin(src, tagName) {
  if (customElements.get(tagName) === void 0) {
    const mod = await import(src);
    customElements.define(tagName, mod.default);
  }
}
