'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { ResumenTab } from './resumen-tab';
import { ImpuestosTab } from './impuestos-tab';
import { PlaceholderTab } from './placeholder-tab';
import { NotasTab } from './notas-tab';
import type { ClienteLegajo } from '../../api/types';

interface ClienteLegajoTabsProps {
  legajo: ClienteLegajo;
  onEdit?: () => void;
}

export function ClienteLegajoTabs({ legajo, onEdit }: ClienteLegajoTabsProps) {
  return (
    <Tabs defaultValue='resumen' className='w-full'>
      <TabsList className='w-full justify-start overflow-x-auto'>
        <TabsTrigger value='resumen'>
          <Icons.info className='mr-1 h-4 w-4' /> Resumen
        </TabsTrigger>
        <TabsTrigger value='impuestos'>
          <Icons.fileText className='mr-1 h-4 w-4' /> Impuestos
        </TabsTrigger>
        <TabsTrigger value='tareas'>
          <Icons.checks className='mr-1 h-4 w-4' /> Tareas
        </TabsTrigger>
        <TabsTrigger value='liquidaciones'>
          <Icons.trendingUp className='mr-1 h-4 w-4' /> Liquidaciones
        </TabsTrigger>
        <TabsTrigger value='archivos'>
          <Icons.upload className='mr-1 h-4 w-4' /> Archivos
        </TabsTrigger>
        <TabsTrigger value='comunicaciones'>
          <Icons.chat className='mr-1 h-4 w-4' /> Comunicaciones
        </TabsTrigger>
        <TabsTrigger value='notas'>
          <Icons.post className='mr-1 h-4 w-4' /> Notas
        </TabsTrigger>
      </TabsList>

      <TabsContent value='resumen' className='mt-4'>
        <ResumenTab legajo={legajo} onEdit={onEdit} />
      </TabsContent>

      <TabsContent value='impuestos' className='mt-4'>
        <ImpuestosTab impuestos={legajo.impuestos} />
      </TabsContent>

      <TabsContent value='tareas' className='mt-4'>
        <PlaceholderTab title='Tareas' />
      </TabsContent>

      <TabsContent value='liquidaciones' className='mt-4'>
        <PlaceholderTab title='Liquidaciones' />
      </TabsContent>

      <TabsContent value='archivos' className='mt-4'>
        <PlaceholderTab title='Archivos' />
      </TabsContent>

      <TabsContent value='comunicaciones' className='mt-4'>
        <PlaceholderTab title='Comunicaciones' />
      </TabsContent>

      <TabsContent value='notas' className='mt-4'>
        <NotasTab clienteId={legajo.id} />
      </TabsContent>
    </Tabs>
  );
}
