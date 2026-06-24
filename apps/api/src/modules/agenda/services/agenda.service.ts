import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AgendaRepository } from 'src/common/database/repositories/agenda.repository';
import { UserRepository } from 'src/common/database/repositories/user.repository';
import { UserRole } from 'src/common/database/enums/role.enum';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import type { CreateAgendaItemDto } from '../dtos/agenda.dto';
import type { UpdateAgendaItemDto } from '../dtos/agenda.update.dto';

@Injectable()
export class AgendaService {
    private readonly logger = new Logger(AgendaService.name);
    constructor(
        private readonly repo: AgendaRepository,
        private readonly userRepo: UserRepository,
    ) {}

    findAll(options: { usuarioId?: string; fechaDesde?: Date; fechaHasta?: Date }) {
        return this.repo.findAll(options);
    }

    findEquipo(options: { fechaDesde?: Date; fechaHasta?: Date; usuarioId?: string }) {
        return this.repo.findAll({
            esEstudio: true,
            fechaDesde: options.fechaDesde,
            fechaHasta: options.fechaHasta,
            usuarioId: options.usuarioId,
        });
    }

    async findUsuarios() {
        return this.userRepo.findAll({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findById(id: number) {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('agenda.error.notFound', HttpStatus.NOT_FOUND);
        return item;
    }

    create(data: CreateAgendaItemDto & { usuarioId: string; origen: string }) {
        if (data.recurrenceRule) {
            this.validateRrule(data.recurrenceRule);
        }
        return this.repo.create(data);
    }

    async update(id: number, user: IAuthUser, data: UpdateAgendaItemDto) {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('agenda.error.notFound', HttpStatus.NOT_FOUND);
        if (item.usuarioId !== user.userId && user.role !== UserRole.SOCIO) {
            throw new HttpException('agenda.error.forbidden', HttpStatus.FORBIDDEN);
        }
        if (data.recurrenceRule) {
            this.validateRrule(data.recurrenceRule);
        }
        return this.repo.update(id, data);
    }

    async softDelete(id: number, user: IAuthUser): Promise<ApiGenericResponseDto> {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('agenda.error.notFound', HttpStatus.NOT_FOUND);
        if (item.usuarioId !== user.userId && user.role !== UserRole.SOCIO) {
            throw new HttpException('agenda.error.forbidden', HttpStatus.FORBIDDEN);
        }
        await this.repo.softDelete(id);
        return { success: true, message: 'agenda.success.deleted' };
    }

    /**
     * Basic validation of an RFC 5545 RRULE string.
     * Checks that the rule starts with FREQ= and contains no obviously invalid parts.
     * Full RRULE validation is out of scope — this is a sanity check.
     */
    private validateRrule(rule: string): void {
        if (!rule || !rule.startsWith('FREQ=')) {
            throw new HttpException('agenda.error.invalidRrule', HttpStatus.BAD_REQUEST);
        }
        const validFreq = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
        const freqMatch = rule.match(/FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/);
        if (!freqMatch) {
            throw new HttpException('agenda.error.invalidRrule', HttpStatus.BAD_REQUEST);
        }
    }
}
