import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { messages } from "./messages";
export const languages = { ru: "Русский", en: "English", tk: "Türkmençe" };
export type Language = keyof typeof languages;
export function translate(key: string, language: Language) {
  return messages[key]?.[["ru", "en", "tk"].indexOf(language)] || key;
}
const Context = createContext({
  language: "ru" as Language,
  setLanguage: (_value: Language) => {},
  t: (key: string) => key,
  locale: "ru-RU",
});
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const value =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem("mekan-language");
      if (value && value in languages) return value as Language;
    } catch {}
    return "ru";
  });
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = "Mekan — " + translate("appSubtitle", language);
    try {
      localStorage.setItem("mekan-language", language);
    } catch {}
  }, [language]);
  return (
    <Context.Provider
      value={{
        language,
        setLanguage,
        t: (key) => translate(key, language),
        locale: { ru: "ru-RU", en: "en-GB", tk: "tk-TM" }[language],
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
export function LanguageSelect() {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="language">
      <span className="sr-only">{t("language")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        {Object.entries(languages).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
