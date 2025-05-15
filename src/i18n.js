import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi) // To load translations from files
  .use(LanguageDetector) // Detect the user's preferred language
  .use(initReactI18next) // Bind i18n to React
  .init({
    fallbackLng: "en", // Fallback language
    supportedLngs: ["en", "ar"], // Add supported languages
    interpolation: {
      escapeValue: false, // React already escapes text
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Translation files path
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["cookie"],
    },
  });

export default i18n;
