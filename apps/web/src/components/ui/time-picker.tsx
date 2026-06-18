'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  step?: number;
  placeholder?: string;
}

const HOURS_IN_DAY = 24;
const MINUTES_PER_HOUR = 60;

function buildSlots(step: number): string[] {
  const slots: string[] = [];
  for (let h = 0; h < HOURS_IN_DAY; h++) {
    for (let m = 0; m < MINUTES_PER_HOUR; m += step) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

function formatSlotLabel(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function TimePicker({ value, onChange, disabled, step = 15, placeholder = 'Seleccionar hora' }: TimePickerProps) {
  const slots = React.useMemo(() => buildSlots(step), [step]);
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
        >
          <Icons.clock className="mr-2 h-4 w-4" />
          {value ? formatSlotLabel(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar hora..." />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {slots.map((slot) => (
                <CommandItem
                  key={slot}
                  value={slot}
                  onSelect={(v) => {
                    onChange?.(v);
                    setOpen(false);
                  }}
                >
                  <Icons.check className={cn('mr-2 h-4 w-4', value === slot ? 'opacity-100' : 'opacity-0')} />
                  {formatSlotLabel(slot)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker };
