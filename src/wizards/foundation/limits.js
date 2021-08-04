const nameStartChar = "[:_A-Za-z]|[\xC0-\xD6]|[\xD8-\xF6]|[\xF8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u{10000}\\-\u{EFFFF}]";
const nameChar = nameStartChar + "|[.0-9-]|\xB7|[\u0300-\u036F]|[\u203F-\u2040]";
const name = nameStartChar + "(" + nameChar + ")*";
const nmToken = "(" + nameChar + ")+";
export const patterns = {
  string: "([	-\n]|[\r]|[ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  normalizedString: "([ -~]|[\x85]|[\xA0-\uD7FF]|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*",
  name,
  nmToken,
  names: name + "( " + name + ")*",
  nmTokens: nmToken + "( " + nmToken + ")*",
  decimal: "((-|\\+)?([0-9]+(\\.[0-9]*)?|\\.[0-9]+))",
  unsigned: "\\+?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)",
  alphanumericFirstUpperCase: "[A-Z][0-9,A-Z,a-z]*",
  asciName: "[A-Za-z][0-9,A-Z,a-z_]*",
  lnClass: "[A-Z]{4,4}",
  restrName1stU: "[a-z][0-9A-Za-z]*",
  abstractDataAttributeName: "((T)|(Test)|(Check)|(SIUnit)|(Open)|(SBO)|(SBOw)|(Cancel)|[a-z][0-9A-Za-z]*)"
};
export const maxLength = {
  cbName: 32,
  abstracDaName: 60
};
