'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { vencimientosQueryOptions } from '@/features/vencimientos/api/queries';
import { ExcelImportModal } from '@/features/vencimientos/components/excel-import-modal';

export default function VencimientosPage() {
  const [importOpen, setImportOpen] = useState(false);
  const { data: vencimientos, isLoading } = useQuery(vencimientosQueryOptions());
  const items = vencimientos ?? [];

  if (isLoading) {
    return (
      <PageContainer pageTitle="Vencimientos" pageDescription="Calendario de vencimientos impositivos">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Cargando...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle="Vencimientos"
      pageDescription="Calendario de vencimientos impositivos"
      pageHeaderAction={
        <Button onClick={() => setImportOpen(true)}>
          <Icons.upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>
      }
    >
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Impuesto</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Mes</TableHead>
              <TableHead>Dígito CUIT</TableHead>
              <TableHead>Vence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay vencimientos cargados
                </TableCell>
              </TableRow>
            ) : (
              items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.impuesto}</TableCell>
                  <TableCell>{v.anio}</TableCell>
                  <TableCell>{v.mes}</TableCell>
                  <TableCell>{v.digitoCuit}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {new Date(v.fechaVence).toLocaleDateString('es-AR')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ExcelImportModal open={importOpen} onOpenChange={setImportOpen} />
    </PageContainer>
  );
}
