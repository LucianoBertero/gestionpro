'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';

interface PlaceholderTabProps {
  title: string;
}

export function PlaceholderTab({ title }: PlaceholderTabProps) {
  const t = useT();
  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
        <Icons.clock className='text-muted-foreground h-12 w-12' />
        <div>
          <p className='text-muted-foreground text-lg font-semibold'>{title}</p>
          <p className='text-muted-foreground text-sm'>{t('common.soon', 'Próximamente')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
