import {de as de2} from "./de.js";
import {en as en2} from "./en.js";
export const languages = {en: en2, de: de2};
export async function loader(lang) {
  if (Object.keys(languages).includes(lang))
    return languages[lang];
  else
    return {};
}
