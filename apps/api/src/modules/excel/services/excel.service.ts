import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import { DatabaseService } from 'src/common/database/services/database.service';

@Injectable()
export class ExcelService {
    private readonly logger = new Logger(ExcelService.name);
    constructor(private readonly db: DatabaseService) {}

    // ─── Import ───────────────────────────────────────────────────────────

    async importClientes(file: any) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const resultados = { creados: 0, errores: 0, detalles: [] as string[] };

        for (const row of rows) {
            try {
                if (!row.cuit || !row.denominacion || !row.encargadoId) {
                    resultados.errores++;
                    resultados.detalles.push(`Fila sin datos requeridos: ${JSON.stringify(row)}`);
                    continue;
                }
                await this.db.cliente.create({
                    data: {
                        cuit: String(row.cuit),
                        denominacion: String(row.denominacion),
                        condicionIva: row.condicionIva ? String(row.condicionIva) : 'Responsable Inscripto',
                        encargadoId: String(row.encargadoId),
                        domicilio: row.domicilio ? String(row.domicilio) : null,
                        email: row.email ? String(row.email) : null,
                        telefono: row.telefono ? String(row.telefono) : null,
                    },
                });
                resultados.creados++;
            } catch (err: any) {
                resultados.errores++;
                resultados.detalles.push(`Error en fila: ${err.message}`);
            }
        }

        return resultados;
    }

    async importComprobantes(file: any) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const preview = rows.slice(0, 50).map((row) => ({
            fecha: row.fecha || row.Fecha,
            cuit: row.cuit || row.CUIT,
            denominacion: row.denominacion || row.Denominacion || row['Razon Social'],
            tipo: row.tipo || row.Tipo,
            importe: parseFloat(row.importe || row.Importe || '0'),
            impuesto: row.impuesto || row.Impuesto || 'IVA',
            periodo: row.periodo || row.Periodo,
        }));

        return { totalFilas: rows.length, preview };
    }

    // ─── Export ───────────────────────────────────────────────────────────

    private sendXlsx(res: Response, data: any[], filename: string, sheetName: string) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }

    async exportClientes(res: Response) {
        const clientes = await this.db.cliente.findMany({
            where: { activo: true },
            include: { encargado: { select: { nombre: true } } },
        });
        const data = clientes.map((c) => ({
            CUIT: c.cuit,
            Denominación: c.denominacion,
            'Condición IVA': c.condicionIva,
            Encargado: c.encargado.nombre,
            Semáforo: c.semaforo,
            Teléfono: c.telefono ?? '',
            Email: c.email ?? '',
            WhatsApp: c.whatsapp ?? '',
        }));
        this.sendXlsx(res, data, 'clientes.xlsx', 'Clientes');
    }

    async exportTareas(res: Response) {
        const tareas = await this.db.tarea.findMany({
            where: { activo: true },
            include: {
                encargado: { select: { nombre: true } },
                cliente: { select: { denominacion: true } },
            },
        });
        const data = tareas.map((t) => ({
            Título: t.titulo,
            Cliente: t.cliente?.denominacion ?? '',
            Tipo: t.tipo,
            Impuesto: t.impuesto ?? '',
            Período: t.periodo ?? '',
            Prioridad: t.prioridad,
            Estado: t.estado,
            Vence: t.vence?.toISOString()?.slice(0, 10) ?? '',
            Encargado: t.encargado.nombre,
        }));
        this.sendXlsx(res, data, 'tareas.xlsx', 'Tareas');
    }

    async exportLiquidaciones(res: Response, clienteId?: number) {
        const where: any = { activo: true };
        if (clienteId) where.clienteId = clienteId;

        const liquidaciones = await this.db.liquidacion.findMany({
            where,
            include: {
                cliente: { select: { denominacion: true } },
                cargadoPor: { select: { nombre: true } },
            },
        });
        const data = liquidaciones.map((l) => ({
            Cliente: l.cliente?.denominacion ?? '',
            Impuesto: l.impuesto,
            Período: l.periodo,
            Resultado: l.resultado,
            Importe: l.importe?.toNumber() ?? 0,
            'Importe Ref.': l.importeRef?.toNumber() ?? 0,
            Vencimiento: l.vencimiento?.toISOString()?.slice(0, 10) ?? '',
            'Forma Pago': l.formaPago ?? '',
            Cargado: l.cargadoPor?.nombre ?? '',
        }));
        this.sendXlsx(res, data, 'liquidaciones.xlsx', 'Liquidaciones');
    }

    async exportVencimientos(res: Response) {
        const vencimientos = await this.db.calendarioVencimiento.findMany({
            orderBy: { fechaVence: 'asc' },
        });
        const data = vencimientos.map((v) => ({
            Impuesto: v.impuesto,
            Año: v.anio,
            Mes: v.mes,
            'Dígito CUIT': v.digitoCuit,
            'Fecha Vencimiento': v.fechaVence.toISOString().slice(0, 10),
        }));
        this.sendXlsx(res, data, 'vencimientos.xlsx', 'Vencimientos');
    }
}
