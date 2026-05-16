'use client';

import { useEffect, useState } from 'react';
import i18next from './config';

export function useT() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChanged = () => forceUpdate((n) => n + 1);
    i18next.on('languageChanged', handleLanguageChanged);
    return () => {
      i18next.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return i18next.t.bind(i18next);
}

export function useCurrentLanguage() {
  return i18next.language;
}

export function changeLanguage(lng: string) {
  return i18next.changeLanguage(lng);
}
