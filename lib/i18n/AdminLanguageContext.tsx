'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_TRANSLATIONS, AdminLocale, TranslationKey } from './admin-translations';

interface AdminLanguageContextType {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: TranslationKey) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('ID');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('admin_locale') as AdminLocale;
      if (savedLocale === 'ID' || savedLocale === 'EN') {
        setLocaleState(savedLocale);
      }
    } catch {
      // Ignore localStorage read errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLocale = (newLocale: AdminLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('admin_locale', newLocale);
    } catch {
      // Ignore storage write errors
    }
  };

  const t = (key: TranslationKey): string => {
    return ADMIN_TRANSLATIONS[locale]?.[key] || ADMIN_TRANSLATIONS.ID[key] || key;
  };

  return (
    <AdminLanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: 'ID' as AdminLocale,
      setLocale: () => {},
      t: (key: TranslationKey) => ADMIN_TRANSLATIONS.ID[key] || key,
    };
  }
  return context;
}
