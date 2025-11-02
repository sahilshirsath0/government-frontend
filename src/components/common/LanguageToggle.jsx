import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLangLabel = i18n.language === 'en' ? 'मराठी' : 'English';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors duration-200 text-sm font-medium"
    >
      <Globe size={16} />
      <span>{currentLangLabel}</span>
    </button>
  );
};

export default LanguageToggle;
