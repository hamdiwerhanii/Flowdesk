import en from "../../locales/en.json";
import fr from "../../locales/fr.json";

type Messages = { [key: string]: string | Messages };

const flatten = (messages: Messages, prefix = ""): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : flatten(value, `${prefix}${key}.`)
  );

const placeholders = (text: string): string[] =>
  [...text.matchAll(/\{(\w+)[,}]/g)].map(match => match[1]).sort();

const lookup = (messages: Messages, path: string): string =>
  path
    .split(".")
    .reduce<string | Messages>(
      (node, key) => (node as Messages)[key],
      messages
    ) as string;

describe("translations", () => {
  const enKeys = flatten(en);
  const frKeys = flatten(fr);

  it("French has exactly the English keys", () => {
    expect(frKeys.filter(key => !enKeys.includes(key))).toEqual([]);
    expect(enKeys.filter(key => !frKeys.includes(key))).toEqual([]);
  });

  it("every translation uses the same placeholders", () => {
    for (const key of enKeys) {
      expect([key, placeholders(lookup(fr, key))]).toEqual([
        key,
        placeholders(lookup(en, key))
      ]);
    }
  });

  it("validation keys used by the schemas exist", () => {
    for (const key of [
      "required",
      "invalidEmail",
      "minChars2",
      "minChars3",
      "minChars8",
      "slugFormat",
      "descriptionMin",
      "messageRequired",
      "passwordsMismatch",
      "requesterRequired"
    ]) {
      expect(enKeys).toContain(`validation.${key}`);
    }
  });
});
