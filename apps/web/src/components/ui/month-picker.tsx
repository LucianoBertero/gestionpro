'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  /** Period in 'YYYY-MM' format. */
  value?: string;
  /** Receives the new period in 'YYYY-MM' format. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Year range around today. Defaults to ±5 years. */
  yearRange?: number;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parsePeriod(value?: string): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function formatPeriod(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function MonthPicker({
  value,
  onChange,
  disabled,
  placeholder = 'Seleccionar período',
  yearRange = 5,
}: MonthPickerProps) {
  const parsed = parsePeriod(value);
  const today = new Date();
  const fallbackYear = today.getFullYear();
  const fallbackMonth = today.getMonth() + 1;

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = fallbackYear - yearRange; y <= fallbackYear + yearRange; y++) {
      list.push(y);
    }
    return list;
  }, [fallbackYear, yearRange]);

  const handleMonthChange = (val: string) => {
    const month = Number(val);
    const year = parsed?.year ?? fallbackYear;
    onChange?.(formatPeriod(year, month));
  };

  const handleYearChange = (val: string) => {
    const year = Number(val);
    const month = parsed?.month ?? fallbackMonth;
    onChange?.(formatPeriod(year, month));
  };

  const displayLabel = parsed
    ? format(new Date(parsed.year, parsed.month - 1, 1), 'MMMM yyyy', { locale: es })
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <Icons.calendar className='mr-2 h-4 w-4' />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-3' align='start'>
        <div className='flex gap-2'>
          <Select
            value={parsed ? String(parsed.month) : undefined}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Mes' />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_ES.map((name, idx) => (
                <SelectItem key={idx + 1} value={String(idx + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={parsed ? String(parsed.year) : undefined}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className='w-[100px]'>
              <SelectValue placeholder='Año' />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MonthPicker };
