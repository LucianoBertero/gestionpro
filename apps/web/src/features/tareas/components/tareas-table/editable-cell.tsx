'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface EditableSelectCellProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (newValue: T) => void;
  isPending?: boolean;
  renderBadge: (value: T) => React.ReactNode;
}

export function EditableSelectCell<T extends string>({
  value,
  options,
  onChange,
  isPending = false,
  renderBadge,
}: EditableSelectCellProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex cursor-pointer items-center rounded-sm text-left',
            isPending && 'pointer-events-none opacity-50'
          )}
        >
          {renderBadge(value)}
          {isPending ? (
            <Icons.spinner className="ml-1 h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <Icons.chevronDown className="ml-0.5 h-3 w-3 text-muted-foreground/70" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => {
              if (opt.value !== value) {
                onChange(opt.value);
              }
              setOpen(false);
            }}
          >
            {opt.value === value && <Icons.check className="mr-2 h-4 w-4 text-primary" />}
            <span className={opt.value === value ? 'font-medium' : ''}>
              {opt.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
