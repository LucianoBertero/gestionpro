import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CalendarioVencimientoRepository } from 'src/common/database/repositories/calendario-vencimiento.repository';
import { DatabaseService } from 'src/common/database/services/database.service';
import type { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import type { VencimientoListFiltersDto } from '../dtos/vencimiento-list.dto';
import type { VencimientoConClientesDto } from '../dtos/vencimiento-response.dto';

@Injectable()
export class VencimientoService {
    private readonly logger = new Logger(VencimientoService.name);

    constructor(
        private readonly repo: CalendarioVencimientoRepository,
        private readonly db: DatabaseService,
    ) {}

    findAll() { return this.repo.findAll(); }

    findByImpuestoAnioMes(impuesto: TipoImpuesto, anio: number, mes: number) {
        return this.repo.findByImpuestoAnioMes(impuesto, anio, mes);
    }

    calcularVencimiento(cuit: string, impuesto: TipoImpuesto, anio: number, mes: number) {
        const digitoStr = cuit.replace(/\D/g, '').slice(-1);
        const digito = parseInt(digitoStr, 10);
        return this.repo.findVencimiento(impuesto, anio, mes, digito);
    }

    async upsert(data: { impuesto: TipoImpuesto; anio: number; mes: number; digitoCuit: number; fechaVence: Date }) {
        return this.repo.upsert(data);
    }

    /**
     * List vencimientos with optional filters, pagination, and cross-referenced
     * affected clients (clientes whose CUIT ends in the digit AND have the
     * impuesto active in ClienteImpuesto).
     */
    async findAllWithClientes(
        filters: VencimientoListFiltersDto,
    ): Promise<{ data: VencimientoConClientesDto[]; total: number; skip: number; take: number }> {
        const { impuesto, anio, mes, dateFrom, dateTo } = filters;
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 50;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (impuesto) where.impuesto = impuesto;
        if (anio !== undefined) where.anio = anio;
        if (mes !== undefined) where.mes = mes;
        if (dateFrom || dateTo) {
            const fechaVence: Record<string, Date> = {};
            if (dateFrom) fechaVence.gte = new Date(dateFrom);
            if (dateTo) fechaVence.lte = new Date(dateTo);
            where.fechaVence = fechaVence;
        }

        const [vencimientos, total] = await Promise.all([
            this.db.calendarioVencimiento.findMany({
                where: where as any,
                orderBy: { fechaVence: 'asc' },
                skip,
                take: limit,
            }),
            this.db.calendarioVencimiento.count({ where: where as any }),
        ]);

        // Group by (impuesto, digitoCuit) — same clients match multiple
        // (anio, mes) rows for the same tax+digit.
        const groupedByKey = new Map<string, typeof vencimientos>();
        for (const v of vencimientos) {
            const key = `${v.impuesto}-${v.digitoCuit}`;
            if (!groupedByKey.has(key)) groupedByKey.set(key, []);
            groupedByKey.get(key)!.push(v);
        }

        const clientResults = await Promise.all(
            Array.from(groupedByKey.entries()).map(async ([key]) => {
                const [impuestoKey, digitoStr] = key.split('-');
                const digito = parseInt(digitoStr, 10);
                const clientes = await this.db.cliente.findMany({
                    where: {
                        activo: true,
                        cuit: { endsWith: String(digito) },
                        impuestos: {
                            some: {
                                tipo: impuestoKey as TipoImpuesto,
                                activo: true,
                            },
                        },
                    },
                    select: { id: true, denominacion: true, cuit: true },
                    orderBy: { denominacion: 'asc' },
                });
                return { key, clientes };
            }),
        );

        // Build lookup: id → clientes
        const clientesByVencimientoId = new Map<
            number,
            { id: number; denominacion: string; cuit: string }[]
        >();
        for (const { key, clientes } of clientResults) {
            for (const v of vencimientos) {
                const vKey = `${v.impuesto}-${v.digitoCuit}`;
                if (vKey === key) {
                    clientesByVencimientoId.set(v.id, clientes);
                }
            }
        }

        const data = vencimientos.map((v) => ({
            id: v.id,
            impuesto: v.impuesto,
            anio: v.anio,
            mes: v.mes,
            digitoCuit: v.digitoCuit,
            fechaVence: v.fechaVence,
            clientes: clientesByVencimientoId.get(v.id) ?? [],
        }));

        return { data, total, skip, take: limit };
    }
}
