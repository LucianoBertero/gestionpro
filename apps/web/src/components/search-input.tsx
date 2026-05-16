'use client';

import { Icons } from '@/components/icons';
import { useKBar } from '@/components/kbar';
import { Button } from './ui/button';

export default function SearchInput() {
  const { setOpen } = useKBar();

  return (
    <div className='w-full space-y-2'>
      <Button
        type='button'
        variant='outline'
        onClick={() => setOpen(true)}
        className='bg-background text-muted-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64'
      >
        <Icons.search className='mr-2 h-4 w-4' />
        Buscar...
      </Button>
    </div>
  );
}
