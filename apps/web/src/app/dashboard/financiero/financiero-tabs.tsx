'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HonorariosSection } from '@/features/financiero/components/honorarios-section';
import { RentabilidadSection } from '@/features/financiero/components/rentabilidad-section';
import { ProyeccionSection } from '@/features/financiero/components/proyeccion-section';

export function FinancieroTabs() {
  return (
    <Tabs defaultValue="honorarios">
      <TabsList>
        <TabsTrigger value="honorarios">Honorarios</TabsTrigger>
        <TabsTrigger value="rentabilidad">Rentabilidad</TabsTrigger>
        <TabsTrigger value="proyeccion">Proyección</TabsTrigger>
      </TabsList>
      <TabsContent value="honorarios" className="mt-4">
        <HonorariosSection />
      </TabsContent>
      <TabsContent value="rentabilidad" className="mt-4">
        <RentabilidadSection />
      </TabsContent>
      <TabsContent value="proyeccion" className="mt-4">
        <ProyeccionSection />
      </TabsContent>
    </Tabs>
  );
}
