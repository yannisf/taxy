import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEn from './locales/en/common.json';
import navigationEn from './locales/en/navigation.json';
import kidsEn from './locales/en/kids.json';
import guardiansEn from './locales/en/guardians.json';
import classesEn from './locales/en/classes.json';
import formsEn from './locales/en/forms.json';
import messagesEn from './locales/en/messages.json';
import pdfEn from './locales/en/pdf.json';

import commonEl from './locales/el/common.json';
import navigationEl from './locales/el/navigation.json';
import kidsEl from './locales/el/kids.json';
import guardiansEl from './locales/el/guardians.json';
import classesEl from './locales/el/classes.json';
import formsEl from './locales/el/forms.json';
import messagesEl from './locales/el/messages.json';
import pdfEl from './locales/el/pdf.json';

const resources = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    kids: kidsEn,
    guardians: guardiansEn,
    classes: classesEn,
    forms: formsEn,
    messages: messagesEn,
    pdf: pdfEn,
  },
  el: {
    common: commonEl,
    navigation: navigationEl,
    kids: kidsEl,
    guardians: guardiansEl,
    classes: classesEl,
    forms: formsEl,
    messages: messagesEl,
    pdf: pdfEl,
  },
};

// Debug logging
console.log('i18n resources:', resources);
console.log('Greek common translations:', commonEl);
console.log('Greek classes translations:', classesEl);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Default namespace
    defaultNS: 'common',
    ns: ['common', 'navigation', 'kids', 'guardians', 'classes', 'forms', 'messages', 'pdf'],
  });

export default i18n;
