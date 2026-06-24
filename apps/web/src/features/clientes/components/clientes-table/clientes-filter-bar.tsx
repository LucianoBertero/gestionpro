'use client';

import * as React from 'react';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@radix-ui/react-icons';
import { SEMAFORO_OPTIONS } from './options';
import type { ActiveUser } from '@/features/auth/api/types';

// ─── Types ────────────────────────────────────────────────────────────

interface ClientesFilterBarProps {
  search: string;
  encargadoId: string;
  semaforo: string[];
  setSearch: (value: string | null) => Promise<URLSearchParams>;
  setEncargadoId: (value: string | null) => Promise<URLSearchParams>;
  setSemaforo: (value: string[] | null) => Promise<URLSearchParams>;
  users: ActiveUser[];
}

// ─── Semáforo multi-select ────────────────────────────────────────────

function SemaforoMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const t = useT();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string, isSelected: boolean) => {
    if (isSelected) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='border-dashed'>
          {selected.length > 0 ? (
            <span
              role='button'
              tabIndex={0}
              aria-label={t('cliente.filter.clearSemaforo', { defaultValue: 'Limpiar semáforo' })}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className='focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none cursor-pointer'
            >
              <Icons.xCircle />
            </span>
          ) : (
            <Icons.plusCircle />
          )}
          {t('cliente.filter.semaforoLabel', { defaultValue: 'Semáforo' })}
          {selected.length > 0 && (
            <>
              <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                {selected.length}
              </Badge>
              <div className='hidden items-center gap-1 lg:flex'>
                {selected.length > 2 ? (
                  <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                    {selected.length} {t('common.selected', { defaultValue: 'selected' })}
                  </Badge>
                ) : (
                  SEMAFORO_OPTIONS.filter((o) => selected.includes(o.value)).map((o) => (
                    <Badge variant='secondary' key={o.value} className='rounded-sm px-1 font-normal'>
                      {o.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[12.5rem] p-0' align='start'>
        <Command>
          <CommandInput placeholder={t('cliente.filter.semaforoLabel', { defaultValue: 'Semáforo' })} />
          <CommandList className='max-h-full'>
            <CommandEmpty>{t('common.noResults', { defaultValue: 'Sin resultados' })}</CommandEmpty>
            <CommandGroup className='max-h-[18.75rem] overflow-x-hidden overflow-y-auto'>
              {SEMAFORO_OPTIONS.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem key={option.value} onSelect={() => handleSelect(option.value, isSelected)}>
                    <div
                      className={cn(
                        'border-primary flex size-4 items-center justify-center rounded-sm border',
                        isSelected ? 'bg-primary' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon />
                    </div>
                    <span className='truncate'>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className='justify-center text-center'>
                    {t('cliente.filter.clear', { defaultValue: 'Limpiar filtros' })}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────

export function ClientesFilterBar({
  search,
  encargadoId,
  semaforo,
  setSearch,
  setEncargadoId,
  setSemaforo,
  users,
}: ClientesFilterBarProps) {
  const t = useT();

  const hasFilters = search !== '' || encargadoId !== '' || semaforo.length > 0;

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value || null);
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

  const handleEncargadoChange = (value: string) => {
    setEncargadoId(value === 'all' ? null : value);
  };

  const handleSemaforoChange = (values: string[]) => {
    setSemaforo(values.length > 0 ? values : null);
  };

  const handleClear = () => {
    setSearch(null);
    setEncargadoId(null);
    setSemaforo(null);
  };

  return (
    <div className='flex w-full items-start justify-between gap-2 p-1'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* Search */}
        <Input
          placeholder={t('cliente.filter.searchPlaceholder', { defaultValue: 'Buscar por denominación o CUIT...' })}
          defaultValue={search}
          onChange={handleSearchChange}
          className='h-8 w-40 lg:w-56'
        />

        {/* Encargado */}
        <Select
          value={encargadoId || 'all'}
          onValueChange={handleEncargadoChange}
        >
          <SelectTrigger className='h-8 w-[140px]'>
            <SelectValue
              placeholder={t('cliente.filter.encargadoLabel', { defaultValue: 'Encargado' })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {t('cliente.filter.encargadoAll', { defaultValue: 'Todos' })}
            </SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semáforo */}
        <SemaforoMultiSelect
          selected={semaforo}
          onChange={handleSemaforoChange}
        />

        {/* Clear */}
        {hasFilters && (
          <Button
            variant='outline'
            size='sm'
            className='border-dashed'
            onClick={handleClear}
          >
            <Icons.close className='mr-1 h-3.5 w-3.5' />
            {t('cliente.filter.clear', { defaultValue: 'Limpiar filtros' })}
          </Button>
        )}
      </div>
    </div>
  );
}
