'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  const resolved = value ?? '09:00';
  const [hours, minutes] = resolved.split(':');

  const handleHoursChange = (h: string) => {
    onChange?.(`${h}:${minutes}`);
  };

  const handleMinutesChange = (m: string) => {
    onChange?.(`${hours}:${m}`);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Select value={hours} onValueChange={handleHoursChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-sm">:</span>
      <Select value={minutes} onValueChange={handleMinutesChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { TimePicker };
