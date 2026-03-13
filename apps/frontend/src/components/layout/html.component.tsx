'use client';
import { FC, useEffect, useState } from 'react';
import { useTranslationSettings } from '@gitroom/react/translation/get.transation.service.client';

// Explicit list of RTL languages - only these will get dir="rtl"
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const HtmlComponent: FC = () => {
  const settings = useTranslationSettings();
  const getDir = () => {
    const lng = settings.language || settings.resolvedLanguage || 'en';
    return RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
  };
  const [dir, setDir] = useState(getDir());

  useEffect(() => {
    settings.on('languageChanged', (lng) => {
      setDir(RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr');
    });
  }, []);

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      htmlElement.setAttribute('dir', dir);
    }
  }, [dir]);

  return null;
};

