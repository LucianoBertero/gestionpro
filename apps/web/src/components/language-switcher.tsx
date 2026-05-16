'use client';

import { useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { changeLanguage, useCurrentLanguage } from '@/lib/i18n/client';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { Icons } from '@/components/icons';

export function LanguageSwitcher() {
  const currentLang = useCurrentLanguage();

  const handleChange = useCallback((code: string) => {
    changeLanguage(code);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Icons.language className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={lang.code === currentLang ? 'font-bold' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
