'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotasTabProps {
  notas: string | null;
}

export function NotasTab({ notas }: NotasTabProps) {
  if (!notas) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>
          No hay notas para este cliente.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm whitespace-pre-wrap leading-relaxed'>{notas}</p>
      </CardContent>
    </Card>
  );
}
