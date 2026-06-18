import type { Locale } from "@gigabike/supabase";
import { DEFAULT_LOCALE, LOCALES } from "@gigabike/supabase";
import en from "./messages/en.json";
import ka from "./messages/ka.json";
import ru from "./messages/ru.json";

export type Dict = Record<string, string>;

export const dictionaries: Record<Locale, Dict> = {
  en: en as Dict,
  ka: ka as Dict,
  ru: ru as Dict,
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** Build a translator over a dictionary, with English fallback and {var} interpolation. */
export function createT(dict: Dict) {
  return (key: string, vars?: Record<string, string | number>): string => {
    let str = dict[key] ?? dictionaries.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

export type Translator = ReturnType<typeof createT>;

export { DEFAULT_LOCALE, LOCALES };
export type { Locale };
