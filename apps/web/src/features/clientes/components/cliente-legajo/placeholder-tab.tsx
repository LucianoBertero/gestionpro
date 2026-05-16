'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface PlaceholderTabProps {
  title: string;
}

export function PlaceholderTab({ title }: PlaceholderTabProps) {
  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
        <Icons.clock className='text-muted-foreground h-12 w-12' />
        <div>
          <p className='text-lg font-semibold text-muted-foreground'>
            {title}
          </p>
          <p className='text-muted-foreground text-sm'>Próximamente</p>
        </div>
      </CardContent>
    </Card>
  );
}
