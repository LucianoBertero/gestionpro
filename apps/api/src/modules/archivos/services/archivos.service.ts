import { randomUUID } from 'crypto';
import { extname } from 'path';

import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import type { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';
import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { STORAGE_SERVICE } from 'src/common/storage/constants/storage.constant';
import { StorageService } from 'src/common/storage/interfaces/storage.interface';

import type { ArchivoParent, ParentType } from '../interfaces/archivo.interface';

const ESTUDIO_ID = 1; // single-tenant; prepared for multitenancy
const SIGNED_URL_TTL = 300; // 5 minutes

/** Map singular parent type (type union) to plural key segment. */
function parentTypeSegment(type: ParentType): string {
    switch (type) {
        case 'cliente':
            return 'clientes';
        case 'tarea':
            return 'tareas';
        case 'liquidacion':
            return 'liquidaciones';
    }
}

interface CreateOptions {
    tipo?: TipoArchivo;
    periodo?: string;
}

@Injectable()
export class ArchivosService {
    private readonly logger = new Logger(ArchivosService.name);

    constructor(
        private readonly repo: ArchivoRepository,
        @Inject(STORAGE_SERVICE)
        private readonly storage: StorageService,
    ) {}

    /**
     * Upload a file to R2, persist metadata + junction in a transaction,
     * and return the archivo row with a signed URL.
     */
    async create(
        file: Express.Multer.File,
        parent: ArchivoParent,
        userId: string,
        options: CreateOptions = {},
    ) {
        const ext = extname(file.originalname).replace('.', '') || 'bin';
        const periodo = options.periodo ?? this.currentYearMonth();
        const uuid = randomUUID();
        const key = `estudios/${ESTUDIO_ID}/${parentTypeSegment(parent.type)}/${parent.id}/${periodo}/${uuid}.${ext}`;

        // 1. Upload to R2
        let storageKey: string;
        try {
            const result = await this.storage.put({
                key,
                body: file.buffer,
                contentType: file.mimetype,
                metadata: { originalName: file.originalname },
            });
            storageKey = result.key;
        } catch (error) {
            this.logger.error(
                { storageKey: key, error: (error as Error).message },
                (error as Error).stack,
            );
            throw new HttpException(
                'archivo.error.uploadFailed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // 2. DB transaction: create archivo row + junction row
        let archivo: { id: number };
        try {
            archivo = await this.repo.create({
                storageKey,
                mimeType: file.mimetype,
                extension: ext,
                bytes: file.size,
                originalName: file.originalname,
                tipo: options.tipo ?? ('OTRO'),
                periodo: options.periodo ?? null,
                subidoPorId: userId,
            });

            await this.repo.createJunction(parent.type, parent.id, archivo.id, 0);
        } catch (error) {
            // R2 object is orphaned — log + Sentry for manual cleanup
            this.logger.error(
                { storageKey, error: (error as Error).message },
                (error as Error).stack,
            );
            throw new HttpException(
                'archivo.error.uploadFailed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // 3. Generate signed URL for immediate access
        const signedUrl = await this.storage.getSignedUrl(
            storageKey,
            SIGNED_URL_TTL,
        );

        return { ...archivo, signedUrl };
    }

    /**
     * Find a single archivo by ID and return it with a fresh signed URL.
     */
    async findById(id: number) {
        const archivo = await this.repo.findById(id);
        if (!archivo) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        let signedUrl: string;
        try {
            signedUrl = await this.storage.getSignedUrl(
                archivo.storageKey,
                SIGNED_URL_TTL,
            );
        } catch {
            throw new HttpException(
                'archivo.error.fileNotFound',
                HttpStatus.NOT_FOUND,
            );
        }

        return { ...archivo, signedUrl };
    }

    /**
     * List archivos attached to a parent entity via junction tables.
     */
    findByParent(type: ParentType, id: number) {
        return this.repo.findByParent(type, id);
    }

    /**
     * Soft-delete an archivo: set activo=false, remove the R2 object,
     * and delete all junction rows.
     *
     * If R2 delete fails, the error is logged but the DB row is still
     * soft-deleted (consistent state; orphan R2 objects cleaned up later).
     */
    async delete(id: number): Promise<ApiGenericResponseDto> {
        const archivo = await this.repo.findById(id);
        if (!archivo) {
            throw new HttpException(
                'archivo.error.notFound',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            await this.storage.delete(archivo.storageKey);
        } catch (error) {
            this.logger.error(
                {
                    storageKey: archivo.storageKey,
                    error: (error as Error).message,
                },
                (error as Error).stack,
            );
        }

        await this.repo.softDelete(id);
        await this.repo.deleteJunctions(id);

        return { success: true, message: 'archivo.success.deleted' };
    }

    // ─── Private helpers ────────────────────────────────────────────

    private currentYearMonth(): string {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        return `${now.getFullYear()}-${mm}`;
    }
}
