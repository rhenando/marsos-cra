import { useEffect } from "react";

import { useTranslation } from "react-i18next";

const DirectionWrapper = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language;
    const isArabic = currentLang === "ar";

    document.documentElement.lang = currentLang;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [i18n.language]);

  return children;
};

export default DirectionWrapper;
