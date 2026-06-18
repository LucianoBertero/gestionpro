import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { LiquidacionRepository } from 'src/common/database/repositories/liquidacion.repository';
import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';
import { CalendarioVencimientoRepository } from 'src/common/database/repositories/calendario-vencimiento.repository';
import { ResultadoLiq } from 'src/common/database/enums/resultado-liq.enum';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { CreateLiquidacionDto, LiquidacionResponseDto } from 'src/modules/liquidaciones/dtos/liquidaciones.dto';
import { LiquidacionService } from 'src/modules/liquidaciones/services/liquidaciones.service';
import {
    EstadoImpuestoActual,
    ImpuestoConEstadoResponseDto,
    LiquidacionEstadoMinDto,
} from '../dtos/impuestos-estado.dto';

@Injectable()
export class ImpuestosEstadoService {
    private readonly logger = new Logger(ImpuestosEstadoService.name);

    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly liquidacionRepository: LiquidacionRepository,
        private readonly calendarioVencimientoRepository: CalendarioVencimientoRepository,
        private readonly liquidacionService: LiquidacionService,
    ) {}

    /**
     * Lista los impuestos del cliente enriquecidos con el estado derivado.
     * Combina ClienteImpuesto + CalendarioVencimiento (período actual) + Liquidacion (período actual).
     */
    async findAllByCliente(clienteId: number): Promise<ImpuestoConEstadoResponseDto[]> {
        const legajo = await this.clienteRepository.findById(clienteId);
        if (!legajo) {
            throw new HttpException('clientes.error.clienteNotFound', HttpStatus.NOT_FOUND);
        }

        const { anio, mes } = this.getPeriodoActual();
        const periodoActual = `${anio}-${String(mes).padStart(2, '0')}`;

        const result: ImpuestoConEstadoResponseDto[] = [];

        for (const imp of legajo.impuestos) {
            // Próximo vencimiento: el más próximo (>= hoy) para este impuesto,
            // preferentemente del período actual, sino el siguiente.
            const proximoVencimiento = await this.buscarProximoVencimiento(
                imp.tipo,
                anio,
                mes,
                legajo.cuit,
            );

            // Liquidación del período actual
            const liquidaciones = await this.liquidacionRepository.findByPeriodo(
                clienteId,
                periodoActual,
            );
            const liqActual = liquidaciones.find((l) => l.impuesto === imp.tipo) ?? null;

            const estado = this.derivarEstado(proximoVencimiento, liqActual, periodoActual);

            result.push({
                clienteImpuestoId: imp.id,
                clienteId,
                tipo: imp.tipo,
                activo: imp.activo,
                periodoActual,
                estado,
                proximoVencimiento,
                liquidacionActual: liqActual
                    ? ({
                          id: liqActual.id,
                          periodo: liqActual.periodo,
                          resultado: liqActual.resultado,
                          vencimiento: liqActual.vencimiento,
                          creadoEn: liqActual.creadoEn,
                      } satisfies LiquidacionEstadoMinDto)
                    : null,
            });
        }

        return result;
    }

    /**
     * Marca un impuesto como presentado para el período actual.
     * Crea un Liquidacion con resultado SIN_MOVIMIENTO (placeholder).
     * Si ya existe una Liquidacion para ese período+impuesto, no duplica.
     */
    async marcarPresentado(
        clienteId: number,
        clienteImpuestoId: number,
        authUser: IAuthUser,
    ): Promise<ImpuestoConEstadoResponseDto> {
        const legajo = await this.clienteRepository.findById(clienteId);
        if (!legajo) {
            throw new HttpException('clientes.error.clienteNotFound', HttpStatus.NOT_FOUND);
        }
        const clienteImpuesto = legajo.impuestos.find((i) => i.id === clienteImpuestoId);
        if (!clienteImpuesto) {
            throw new HttpException('impuestos-estado.error.clienteImpuestoNotFound', HttpStatus.NOT_FOUND);
        }

        const { anio, mes } = this.getPeriodoActual();
        const periodoActual = `${anio}-${String(mes).padStart(2, '0')}`;

        // Idempotencia: si ya hay liquidación para este período+impuesto, devolvemos el estado actual
        const existing = await this.liquidacionRepository.findByPeriodo(clienteId, periodoActual);
        if (existing.some((l) => l.impuesto === clienteImpuesto.tipo)) {
            // ya presentado
        } else {
            const createDto: CreateLiquidacionDto = {
                clienteId,
                impuesto: clienteImpuesto.tipo,
                periodo: periodoActual,
                resultado: ResultadoLiq.SIN_MOVIMIENTO,
            };
            await this.liquidacionService.create(createDto, authUser);
        }

        // Devolver el estado recalculado
        const all = await this.findAllByCliente(clienteId);
        const updated = all.find((i) => i.clienteImpuestoId === clienteImpuestoId);
        if (!updated) {
            throw new HttpException('impuestos-estado.error.unexpected', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return updated;
    }

    /**
     * Historial de liquidaciones de un impuesto específico del cliente.
     */
    async findHistorial(
        clienteId: number,
        clienteImpuestoId: number,
    ): Promise<LiquidacionResponseDto[]> {
        const legajo = await this.clienteRepository.findById(clienteId);
        if (!legajo) {
            throw new HttpException('clientes.error.clienteNotFound', HttpStatus.NOT_FOUND);
        }
        const clienteImpuesto = legajo.impuestos.find((i) => i.id === clienteImpuestoId);
        if (!clienteImpuesto) {
            throw new HttpException('impuestos-estado.error.clienteImpuestoNotFound', HttpStatus.NOT_FOUND);
        }

        const all = await this.liquidacionRepository.findByClienteId(clienteId);
        return all.filter((l) => l.impuesto === clienteImpuesto.tipo) as unknown as LiquidacionResponseDto[];
    }

    // ─── Helpers internos ──────────────────────────────────────────────────

    private getPeriodoActual(): { anio: number; mes: number } {
        const now = new Date();
        return { anio: now.getUTCFullYear(), mes: now.getUTCMonth() + 1 };
    }

    /**
     * Busca el próximo vencimiento del impuesto.
     * 1. Primero busca en el período actual.
     * 2. Si no encuentra, busca el próximo (>= hoy) en períodos siguientes.
     * 3. Si no hay ningún vencimiento configurado, devuelve null.
     */
    private async buscarProximoVencimiento(
        tipo: TipoImpuesto,
        anio: number,
        mes: number,
        cuit: string,
    ): Promise<Date | null> {
        const digitoCuit = this.extraerDigitoCuit(cuit);
        if (digitoCuit === null) return null;

        // 1. Período actual
        const actual = await this.calendarioVencimientoRepository.findVencimiento(
            tipo,
            anio,
            mes,
            digitoCuit,
        );
        if (actual?.fechaVence) return actual.fechaVence;

        // 2. Próximo período con fecha futura
        // (no se si tiene más sentido iterar, pero como mucho hay 1-2 meses de delay
        // entre período y vencimiento, probamos mes+1 y mes+2)
        for (let offset = 1; offset <= 2; offset++) {
            const targetMes = mes + offset;
            const targetAnio = anio + Math.floor((targetMes - 1) / 12);
            const normalizedMes = ((targetMes - 1) % 12) + 1;

            const next = await this.calendarioVencimientoRepository.findVencimiento(
                tipo,
                targetAnio,
                normalizedMes,
                digitoCuit,
            );
            if (next?.fechaVence && next.fechaVence >= new Date()) {
                return next.fechaVence;
            }
        }

        return null;
    }

    private extraerDigitoCuit(cuit: string): number | null {
        const digitos = cuit.replace(/\D/g, '');
        if (digitos.length === 0) return null;
        return parseInt(digitos.slice(-1), 10);
    }

    private derivarEstado(
        proximoVencimiento: Date | null,
        liquidacionActual: { periodo: string; resultado: ResultadoLiq } | null,
        periodoActual: string,
    ): EstadoImpuestoActual {
        // Si hay liquidación del período actual → PRESENTADO
        if (liquidacionActual && liquidacionActual.periodo === periodoActual) {
            return EstadoImpuestoActual.PRESENTADO;
        }

        // Si hay fecha de vencimiento y ya pasó (y no hay liquidación) → VENCIDO
        if (proximoVencimiento && proximoVencimiento < new Date()) {
            return EstadoImpuestoActual.VENCIDO;
        }

        // Por defecto → A_PRESENTAR
        return EstadoImpuestoActual.A_PRESENTAR;
    }
}
