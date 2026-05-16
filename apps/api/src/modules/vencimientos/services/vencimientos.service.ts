import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CalendarioVencimientoRepository } from 'src/common/database/repositories/calendario-vencimiento.repository';
import type { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

@Injectable()
export class VencimientoService {
    private readonly logger = new Logger(VencimientoService.name);
    constructor(private readonly repo: CalendarioVencimientoRepository) {}

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
}
