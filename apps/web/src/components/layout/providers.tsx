'use client';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import AuthProvider from './auth-provider';
import QueryProvider from './query-provider';
import { I18nProvider } from '../i18n-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <AuthProvider>
          <QueryProvider>
            <I18nProvider>{children}</I18nProvider>
          </QueryProvider>
        </AuthProvider>
      </ActiveThemeProvider>
    </>
  );
}
