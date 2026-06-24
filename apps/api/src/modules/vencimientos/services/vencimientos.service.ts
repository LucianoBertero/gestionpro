import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CalendarioVencimientoRepository } from 'src/common/database/repositories/calendario-vencimiento.repository';
import { DatabaseService } from 'src/common/database/services/database.service';
import type { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import type { VencimientoListFiltersDto } from '../dtos/vencimiento-list.dto';
import type { VencimientoConClientesDto } from '../dtos/vencimiento-response.dto';
import type { CreateVencimientoDto } from '../dtos/vencimiento-create.dto';

function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

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

    async create(dto: CreateVencimientoDto) {
        return this.repo.upsert({
            impuesto: dto.impuesto,
            anio: dto.anio,
            mes: dto.mes,
            digitoCuit: dto.digitoCuit,
            fechaVence: new Date(dto.fechaVence),
        });
    }

    async createBatch(rows: CreateVencimientoDto[]) {
        const results = await this.db.$transaction(
            rows.map((row) =>
                this.db.calendarioVencimiento.upsert({
                    where: {
                        uq_calendario_vencimiento: {
                            impuesto: row.impuesto,
                            anio: row.anio,
                            mes: row.mes,
                            digitoCuit: row.digitoCuit,
                        },
                    },
                    update: { fechaVence: new Date(row.fechaVence) },
                    create: {
                        impuesto: row.impuesto,
                        anio: row.anio,
                        mes: row.mes,
                        digitoCuit: row.digitoCuit,
                        fechaVence: new Date(row.fechaVence),
                    },
                }),
            ),
        );
        return { created: results.length };
    }

    async duplicateYear(sourceYear: number, targetYear: number) {
        const source = await this.db.calendarioVencimiento.findMany({
            where: { anio: sourceYear },
        });

        if (source.length === 0) {
            return { created: 0 };
        }

        const daysInSourceYear = isLeapYear(sourceYear) ? 366 : 365;

        const rows = source.map((v) => {
            const newDate = new Date(v.fechaVence);
            newDate.setDate(newDate.getDate() + daysInSourceYear);
            return {
                impuesto: v.impuesto,
                anio: targetYear,
                mes: v.mes,
                digitoCuit: v.digitoCuit,
                fechaVence: newDate,
            };
        });

        await this.createBatch(
            rows.map((r) => ({
                impuesto: r.impuesto,
                anio: r.anio,
                mes: r.mes,
                digitoCuit: r.digitoCuit,
                fechaVence: r.fechaVence.toISOString().slice(0, 10),
            })),
        );

        return { created: rows.length };
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
