import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { TipoImpuesto } from '../enums/tipo-impuesto.enum';

@Injectable()
export class CalendarioVencimientoRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll() {
        return this.db.calendarioVencimiento.findMany({ orderBy: { fechaVence: 'asc' } });
    }

    findByImpuestoAnioMes(impuesto: TipoImpuesto, anio: number, mes: number) {
        return this.db.calendarioVencimiento.findMany({
            where: { impuesto, anio, mes },
            orderBy: { digitoCuit: 'asc' },
        });
    }

    findVencimiento(impuesto: TipoImpuesto, anio: number, mes: number, digitoCuit: number) {
        return this.db.calendarioVencimiento.findUnique({
            where: { uq_calendario_vencimiento: { impuesto, anio, mes, digitoCuit } },
        });
    }

    upsert(data: {
        impuesto: TipoImpuesto;
        anio: number;
        mes: number;
        digitoCuit: number;
        fechaVence: Date;
    }) {
        return this.db.calendarioVencimiento.upsert({
            where: {
                uq_calendario_vencimiento: {
                    impuesto: data.impuesto,
                    anio: data.anio,
                    mes: data.mes,
                    digitoCuit: data.digitoCuit,
                },
            },
            create: data,
            update: { fechaVence: data.fechaVence },
        });
    }
}
