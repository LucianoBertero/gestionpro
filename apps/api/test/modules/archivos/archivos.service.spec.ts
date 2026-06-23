import { HttpException, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { STORAGE_SERVICE } from 'src/common/storage/constants/storage.constant';
import { ArchivosService } from 'src/modules/archivos/services/archivos.service';

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
        fieldname: 'file',
        originalname: 'declaracion-iva.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 valid content'),
        size: 5000,
        ...overrides,
    } as Express.Multer.File;
}

describe('ArchivosService', () => {
    let service: ArchivosService;

    const mockRepo = {
        create: jest.fn(),
        findById: jest.fn(),
        findByParent: jest.fn(),
        createJunction: jest.fn(),
        deleteJunctions: jest.fn(),
        softDelete: jest.fn(),
        existsById: jest.fn(),
    };

    const mockStorage = {
        put: jest.fn(),
        get: jest.fn(),
        getSignedUrl: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivosService,
                { provide: ArchivoRepository, useValue: mockRepo },
                { provide: STORAGE_SERVICE, useValue: mockStorage },
            ],
        }).compile();

        service = module.get<ArchivosService>(ArchivosService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── create (upload) ──────────────────────────────────────────────

    describe('create', () => {
        const file = makeFile();
        const parent = { type: 'cliente' as const, id: 42 };
        const userId = 'user-uuid-1';

        const storageKey = 'estudios/1/clientes/42/2026-06/fake-uuid.pdf';
        const signedUrl = 'https://signed-url.example.com/file?token=xyz';

        const archivoRow = {
            id: 1,
            storageKey,
            mimeType: 'application/pdf',
            extension: 'pdf',
            bytes: 5000,
            originalName: 'declaracion-iva.pdf',
            tipo: 'OTRO',
            periodo: null,
            subidoPorId: userId,
            activo: true,
            creadoEn: new Date(),
        };

        it('uploads to storage, creates archivo + junction in transaction, returns signedUrl', async () => {
            mockStorage.put.mockResolvedValue({ key: storageKey });
            mockRepo.create.mockResolvedValue(archivoRow);
            mockRepo.createJunction.mockResolvedValue({
                archivoId: 1,
                orden: 0,
            });
            mockStorage.getSignedUrl.mockResolvedValue(signedUrl);

            const result = await service.create(file, parent, userId);

            expect(mockStorage.put).toHaveBeenCalledWith({
                key: expect.stringMatching(
                    /^estudios\/1\/clientes\/42\/2026-06\/[a-f0-9-]+\.pdf$/
                ),
                body: file.buffer,
                contentType: 'application/pdf',
                metadata: { originalName: 'declaracion-iva.pdf' },
            });

            expect(mockRepo.create).toHaveBeenCalledWith({
                storageKey: expect.any(String),
                mimeType: 'application/pdf',
                extension: 'pdf',
                bytes: 5000,
                originalName: 'declaracion-iva.pdf',
                tipo: 'OTRO',
                periodo: null,
                subidoPorId: userId,
            });

            expect(mockRepo.createJunction).toHaveBeenCalledWith(
                'cliente',
                42,
                1,
                0
            );

            expect(mockStorage.getSignedUrl).toHaveBeenCalledWith(
                expect.any(String),
                300
            );

            expect(result).toEqual({
                ...archivoRow,
                signedUrl,
            });
        });

        it('throws 500 and does NOT create DB rows when storage put() fails', async () => {
            const putError = new Error('Network failure');
            mockStorage.put.mockRejectedValue(putError);

            await expect(
                service.create(file, parent, userId)
            ).rejects.toMatchObject({
                message: 'archivo.error.uploadFailed',
                status: 500,
            });

            expect(mockRepo.create).not.toHaveBeenCalled();
            expect(mockRepo.createJunction).not.toHaveBeenCalled();
        });

        it('logs and throws 500 when DB transaction fails after put() succeeds (orphan R2)', async () => {
            mockStorage.put.mockResolvedValue({ key: storageKey });
            const dbError = new Error('Constraint violation');
            mockRepo.create.mockRejectedValue(dbError);

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();

            await expect(
                service.create(file, parent, userId)
            ).rejects.toThrow(HttpException);

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    storageKey: expect.any(String),
                    error: dbError.message,
                }),
                dbError.stack
            );

            loggerSpy.mockRestore();
        });

        it('generates correct storage key for tarea parent type', async () => {
            const tareaFile = makeFile({
                originalname: 'nota.xlsx',
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const tareaParent = { type: 'tarea' as const, id: 7 };
            mockStorage.put.mockResolvedValue({ key: 'estudios/1/tareas/7/2026-06/uuid.xlsx' });
            mockRepo.create.mockResolvedValue({ id: 2 });
            mockRepo.createJunction.mockResolvedValue({ archivoId: 2, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(tareaFile, tareaParent, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(
                        /^estudios\/1\/tareas\/7\/2026-06\/[a-f0-9-]+\.xlsx$/
                    ),
                })
            );
            expect(mockRepo.createJunction).toHaveBeenCalledWith('tarea', 7, 2, 0);
        });

        it('generates correct storage key for liquidacion parent type', async () => {
            const liqFile = makeFile({
                originalname: 'f-931.docx',
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const liqParent = { type: 'liquidacion' as const, id: 3 };
            mockStorage.put.mockResolvedValue({ key: 'estudios/1/liquidaciones/3/2026-06/uuid.docx' });
            mockRepo.create.mockResolvedValue({ id: 3 });
            mockRepo.createJunction.mockResolvedValue({ archivoId: 3, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(liqFile, liqParent, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(
                        /^estudios\/1\/liquidaciones\/3\/2026-06\/[a-f0-9-]+\.docx$/
                    ),
                })
            );
            expect(mockRepo.createJunction).toHaveBeenCalledWith('liquidacion', 3, 3, 0);
        });

        it('falls back to bin extension when originalName has no extension', async () => {
            const noextFile = makeFile({
                originalname: 'README',
                mimetype: 'application/pdf',
            });
            mockStorage.put.mockResolvedValue({ key: 'estudios/1/clientes/42/2026-06/uuid.bin' });
            mockRepo.create.mockResolvedValue({ id: 5 });
            mockRepo.createJunction.mockResolvedValue({ archivoId: 5, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(noextFile, { type: 'cliente', id: 42 }, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(/\.bin$/),
                })
            );
            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ extension: 'bin' })
            );
        });
    });

    // ── findById ─────────────────────────────────────────────────────

    describe('findById', () => {
        const archivoRow = {
            id: 1,
            storageKey: 'estudios/1/clientes/42/2026-06/uuid.pdf',
            mimeType: 'application/pdf',
            extension: 'pdf',
            bytes: 2048,
            originalName: 'report.pdf',
            tipo: 'DDJJ',
            periodo: '2026-05',
            subidoPorId: 'user-1',
            activo: true,
            creadoEn: new Date(),
        };

        it('returns archivo metadata with signedUrl', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockStorage.getSignedUrl.mockResolvedValue(
                'https://signed.example.com/read'
            );

            const result = await service.findById(1);

            expect(mockStorage.getSignedUrl).toHaveBeenCalledWith(
                archivoRow.storageKey,
                300
            );
            expect(result).toEqual({
                ...archivoRow,
                signedUrl: 'https://signed.example.com/read',
            });
        });

        it('throws 404 when archivo is not found', async () => {
            mockRepo.findById.mockResolvedValue(null);

            await expect(service.findById(999)).rejects.toMatchObject({
                message: 'archivo.error.notFound',
                status: 404,
            });
        });

        it('throws 404 when archivo exists but R2 object is missing', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockStorage.getSignedUrl.mockRejectedValue(
                new Error('NoSuchKey')
            );

            await expect(service.findById(1)).rejects.toMatchObject({
                message: 'archivo.error.fileNotFound',
                status: 404,
            });
        });
    });

    // ── findByParent ─────────────────────────────────────────────────

    describe('findByParent', () => {
        it('returns archivos for a given parent', async () => {
            const junctions = [
                {
                    archivo: {
                        id: 1,
                        storageKey: 'key-1',
                        mimeType: 'application/pdf',
                        extension: 'pdf',
                        bytes: 100,
                        originalName: 'a.pdf',
                        tipo: 'DDJJ',
                        periodo: '2026-05',
                        subidoPorId: 'user-1',
                        activo: true,
                        creadoEn: new Date(),
                    },
                },
            ];
            mockRepo.findByParent.mockResolvedValue(junctions);

            const result = await service.findByParent('cliente', 42);
            expect(result).toEqual(junctions);
            expect(mockRepo.findByParent).toHaveBeenCalledWith('cliente', 42);
        });
    });

    // ── delete ───────────────────────────────────────────────────────

    describe('delete', () => {
        const archivoRow = {
            id: 1,
            storageKey: 'estudios/1/clientes/42/2026-06/uuid.pdf',
            mimeType: 'application/pdf',
            extension: 'pdf',
            bytes: 2048,
            originalName: 'report.pdf',
            tipo: 'DDJJ',
            periodo: '2026-05',
            subidoPorId: 'user-1',
            activo: true,
            creadoEn: new Date(),
        };

        it('soft-deletes, removes R2 object, and deletes junctions', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockRepo.softDelete.mockResolvedValue({
                ...archivoRow,
                activo: false,
            });
            mockStorage.delete.mockResolvedValue(undefined);
            mockRepo.deleteJunctions.mockResolvedValue(undefined);

            const result = await service.delete(1);

            expect(mockStorage.delete).toHaveBeenCalledWith(
                archivoRow.storageKey
            );
            expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
            expect(mockRepo.deleteJunctions).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                success: true,
                message: 'archivo.success.deleted',
            });
        });

        it('throws 404 when archivo is not found', async () => {
            mockRepo.findById.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toMatchObject({
                message: 'archivo.error.notFound',
                status: 404,
            });
        });

        it('still soft-deletes when R2 delete fails (logs the error)', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockRepo.softDelete.mockResolvedValue({
                ...archivoRow,
                activo: false,
            });
            mockRepo.deleteJunctions.mockResolvedValue(undefined);
            mockStorage.delete.mockRejectedValue(
                new Error('Network failure')
            );

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();

            const result = await service.delete(1);

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    storageKey: archivoRow.storageKey,
                }),
                expect.any(String)
            );

            expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
            expect(mockRepo.deleteJunctions).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                success: true,
                message: 'archivo.success.deleted',
            });

            loggerSpy.mockRestore();
        });
    });
});
