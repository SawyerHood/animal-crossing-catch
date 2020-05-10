import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import de from "./de.json";
import fr from "./fr.json";
import ja from "./ja.json";
import es from "./es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: {
          "Made By": 'Made by <a href="http://sawyerhood.com">Sawyer Hood</a>',
        },
      },
      de,
      fr,
      ja,
      es,
    },
    fallbackLng: false,
    debug: false,

    // have a common namespace used around the full app
    ns: ["translations"],
    defaultNS: "translations",
    saveMissing: true,
    saveMissingTo: "current",
    keySeparator: false, // we use content as keys
    interpolation: {
      escapeValue: false,
    },
    
  });

export default i18n;

export const LANGUAGES = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
  es: "Español",
};

export type LanguageOption = keyof typeof LANGUAGES;
