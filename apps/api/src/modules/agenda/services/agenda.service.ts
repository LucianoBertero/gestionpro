import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AgendaRepository } from 'src/common/database/repositories/agenda.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

@Injectable()
export class AgendaService {
    private readonly logger = new Logger(AgendaService.name);
    constructor(private readonly repo: AgendaRepository) {}

    findAll(options: { usuarioId?: string; fechaDesde?: Date; fechaHasta?: Date }) {
        return this.repo.findAll(options);
    }

    findEquipo(fechaDesde?: Date, fechaHasta?: Date) {
        return this.repo.findAll({ esEstudio: true, fechaDesde, fechaHasta });
    }

    async findById(id: number) {
        const item = await this.repo.findById(id);
        if (!item) throw new HttpException('agenda.error.notFound', HttpStatus.NOT_FOUND);
        return item;
    }

    create(data: any) { return this.repo.create(data); }
    update(id: number, data: any) { return this.repo.update(id, data); }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.repo.softDelete(id);
        return { success: true, message: 'agenda.success.deleted' };
    }
}
