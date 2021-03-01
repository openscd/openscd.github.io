import transform from "./transform.js";
export default function wrap(html) {
  return (strings, ...values) => html.apply(null, transform(strings, values));
}
