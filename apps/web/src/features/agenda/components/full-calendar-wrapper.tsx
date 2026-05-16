'use client';

import dynamic from 'next/dynamic';

const FullCalendarInner = dynamic(
  () => import('./full-calendar-inner'),
  { ssr: false, loading: () => <div className="flex h-96 items-center justify-center text-muted-foreground">Cargando calendario...</div> }
);

export default FullCalendarInner;
