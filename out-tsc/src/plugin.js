export async function plugin(src, tagName) {
    if (customElements.get(tagName) === undefined) {
        const mod = await import(src);
        customElements.define(tagName, mod.default);
    }
}
//# sourceMappingURL=plugin.js.map