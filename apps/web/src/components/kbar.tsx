'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Icons } from '@/components/icons';
import { navGroups } from '@/config/nav-config';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import type { NavGroup, NavItem } from '@/types';

type KBarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const KBarContext = React.createContext<KBarContextValue | null>(null);

function collectNavItems(groups: NavGroup[]): NavItem[] {
  const items: NavItem[] = [];

  for (const group of groups) {
    for (const item of group.items) {
      if (item.items && item.items.length > 0) {
        items.push(...item.items);
        continue;
      }

      if (item.url !== '#') {
        items.push(item);
      }
    }
  }

  return items;
}

export function useKBar() {
  const context = React.useContext(KBarContext);

  if (!context) {
    throw new Error('useKBar must be used within KBar');
  }

  return context;
}

export default function KBar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const filteredGroups = useFilteredNavGroups(navGroups);
  const items = collectNavItems(filteredGroups);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <KBarContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen} title='Command Palette' description='Search dashboard navigation and shortcuts'>
        <CommandInput placeholder='Search dashboard...' />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          <CommandGroup heading='Navigate'>
            {items.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.arrowRight;

              return (
                <CommandItem
                  key={`${item.title}-${item.url}`}
                  value={`${item.title} ${item.url}`}
                  onSelect={() => {
                    router.push(item.url);
                    setOpen(false);
                  }}
                >
                  <Icon />
                  <span>{item.title}</span>
                  {item.shortcut ? (
                    <span className='text-muted-foreground ml-auto text-xs'>{item.shortcut.join(' ')}</span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </KBarContext.Provider>
  );
}