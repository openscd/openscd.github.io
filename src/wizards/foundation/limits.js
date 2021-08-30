const nameStartChar = "[:_A-Za-z]|[À-Ö]|[Ø-ö]|[ø-˿]|[Ͱ-ͽ]|[Ϳ-῿]|[‌-‍]|[⁰-↏]|[Ⰰ-⿯]|[、-퟿]|[豈-﷏]|[ﷰ-�]|[𐀀\\-󯿿]";
const nameChar = nameStartChar + "|[.0-9-]|·|[̀-ͯ]|[‿-⁀]";
const name = nameStartChar + "(" + nameChar + ")*";
const nmToken = "(" + nameChar + ")+";
export const patterns = {
  string: "([	-\n]|[\r]|[ -~]|[]|[ -퟿]|[-�]|[𐀀\\-􏿿])*",
  normalizedString: "([ -~]|[]|[ -퟿]|[-�]|[𐀀\\-􏿿])*",
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
