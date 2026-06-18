'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from './time-picker';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  /** Step in minutes for the time slot list. Default 15. */
  step?: number;
  placeholder?: string;
}

function DateTimePicker({
  value,
  onChange,
  disabled,
  step = 15,
  placeholder = 'Seleccionar fecha y hora',
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }
    // Preserve current time when only the date changes
    const next = new Date(date);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      next.setHours(9, 0, 0, 0); // default to 09:00
    }
    onChange?.(next);
  };

  const handleTimeSelect = (slot: string) => {
    if (!value) return;
    const [h, m] = slot.split(':').map(Number);
    const next = new Date(value);
    next.setHours(h, m, 0, 0);
    onChange?.(next);
  };

  const currentTime = value
    ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <Icons.calendarClock className="mr-2 h-4 w-4" />
          {value
            ? format(value, "d MMM yyyy, HH:mm", { locale: es })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
        {value && (
          <div className="border-t p-3">
            <TimePicker
              value={currentTime}
              onChange={handleTimeSelect}
              step={step}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker };
