import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { TipoTemplate } from '../enums/tipo-template.enum';

@Injectable()
export class EmailTemplateRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll() {
        return this.db.emailTemplate.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    }

    findById(id: number) {
        return this.db.emailTemplate.findUnique({ where: { id } });
    }

    create(data: { nombre: string; tipo: TipoTemplate; asunto: string; cuerpo: string }) {
        return this.db.emailTemplate.create({ data });
    }

    update(id: number, data: any) {
        return this.db.emailTemplate.update({ where: { id }, data });
    }

    softDelete(id: number) {
        return this.db.emailTemplate.update({ where: { id }, data: { activo: false } });
    }

    async existsById(id: number) {
        const found = await this.db.emailTemplate.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }
}
