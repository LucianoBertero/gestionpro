import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import type { ClaveEstudioEntity, CreateClaveInput, UpdateClaveInput } from '../interfaces/clave-estudio.interface';

@Injectable()
export class ClaveEstudioRepository {
    constructor(private readonly db: DatabaseService) {}

    findAll(): Promise<ClaveEstudioEntity[]> {
        return this.db.claveEstudio.findMany({ orderBy: { entidad: 'asc' } });
    }

    findById(id: string): Promise<ClaveEstudioEntity | null> {
        return this.db.claveEstudio.findUnique({ where: { id } });
    }

    findByEntidad(entidad: string): Promise<ClaveEstudioEntity | null> {
        return this.db.claveEstudio.findUnique({ where: { entidad } });
    }

    async existsByEntidad(entidad: string): Promise<boolean> {
        const found = await this.db.claveEstudio.findUnique({
            where: { entidad },
            select: { id: true },
        });
        return found !== null;
    }

    create(data: CreateClaveInput): Promise<ClaveEstudioEntity> {
        return this.db.claveEstudio.create({
            data: {
                entidad: data.entidad,
                clave: data.clave,
                creadoPorId: data.creadoPorId,
            },
        });
    }

    update(id: string, data: UpdateClaveInput): Promise<ClaveEstudioEntity> {
        return this.db.claveEstudio.update({ where: { id }, data });
    }

    delete(id: string): Promise<ClaveEstudioEntity> {
        return this.db.claveEstudio.delete({ where: { id } });
    }
}
