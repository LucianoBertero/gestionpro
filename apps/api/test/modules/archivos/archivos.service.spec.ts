import { HttpException, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { DatabaseService } from 'src/common/database/services/database.service';
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
        findById: jest.fn(),
        findByParent: jest.fn(),
    };

    const mockStorage = {
        put: jest.fn(),
        get: jest.fn(),
        getSignedUrl: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
    };

    const mockTx = {
        archivo: {
            create: jest.fn(),
            update: jest.fn(),
        },
        archivosCliente: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
        archivosTarea: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
        archivosLiquidacion: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
    };

    const mockDb = {
        $transaction: jest.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivosService,
                { provide: ArchivoRepository, useValue: mockRepo },
                { provide: DatabaseService, useValue: mockDb },
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

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('uploads to storage, creates archivo + junction in transaction, returns signedUrl', async () => {
            mockStorage.put.mockResolvedValue({ key: storageKey });
            mockTx.archivo.create.mockResolvedValue(archivoRow);
            mockTx.archivosCliente.create.mockResolvedValue({
                archivoId: 1,
                clienteId: 42,
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

            // Verify the transaction was used
            expect(mockDb.$transaction).toHaveBeenCalledTimes(1);

            // Verify archivo.create was called inside transaction
            expect(mockTx.archivo.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    storageKey: expect.any(String),
                    mimeType: 'application/pdf',
                    extension: 'pdf',
                    bytes: 5000,
                    originalName: 'declaracion-iva.pdf',
                    tipo: 'OTRO',
                    periodo: null,
                    subidoPorId: userId,
                }),
            });

            // Verify junction creation
            expect(mockTx.archivosCliente.create).toHaveBeenCalledWith({
                data: { archivoId: 1, clienteId: 42, orden: 0 },
            });

            expect(mockStorage.getSignedUrl).toHaveBeenCalledWith(
                expect.any(String),
                300
            );

            expect(result).toEqual({
                ...archivoRow,
                signedUrl,
            });
        });

        it('throws 500 and does NOT enter DB transaction when storage put() fails', async () => {
            const putError = new Error('Network failure');
            mockStorage.put.mockRejectedValue(putError);

            await expect(
                service.create(file, parent, userId)
            ).rejects.toMatchObject({
                message: 'archivo.error.uploadFailed',
                status: 500,
            });

            expect(mockDb.$transaction).not.toHaveBeenCalled();
            expect(mockTx.archivo.create).not.toHaveBeenCalled();
            expect(mockTx.archivosCliente.create).not.toHaveBeenCalled();
        });

        it('logs and throws 500 when archivo.create fails in transaction (orphan R2)', async () => {
            mockStorage.put.mockResolvedValue({ key: storageKey });
            const dbError = new Error('Constraint violation');
            mockTx.archivo.create.mockRejectedValue(dbError);

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

            expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
            // Junction should NOT have been created (transaction rolled back)
            expect(mockTx.archivosCliente.create).not.toHaveBeenCalled();

            loggerSpy.mockRestore();
        });

        it('rolls back archivo.create when createJunction fails inside transaction (C2)', async () => {
            mockStorage.put.mockResolvedValue({ key: storageKey });
            mockTx.archivo.create.mockResolvedValue(archivoRow);
            const junctionError = new Error('FK constraint: parent deleted');
            mockTx.archivosCliente.create.mockRejectedValue(junctionError);

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();

            // The transaction throws because junction.create fails,
            // so the overall service.create should throw
            await expect(
                service.create(file, parent, userId)
            ).rejects.toMatchObject({
                message: 'archivo.error.uploadFailed',
                status: 500,
            });

            // Both were called inside the transaction (archivo.create succeeded,
            // junction.create failed), but the transaction rolled back
            expect(mockTx.archivo.create).toHaveBeenCalledTimes(1);
            expect(mockTx.archivosCliente.create).toHaveBeenCalledTimes(1);
            expect(mockDb.$transaction).toHaveBeenCalledTimes(1);

            // Logged the orphan R2 key
            expect(loggerSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    storageKey: expect.any(String),
                    error: junctionError.message,
                }),
                expect.any(String),
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
            mockTx.archivo.create.mockResolvedValue({ id: 2 });
            mockTx.archivosTarea.create.mockResolvedValue({ archivoId: 2, tareaId: 7, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(tareaFile, tareaParent, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(
                        /^estudios\/1\/tareas\/7\/2026-06\/[a-f0-9-]+\.xlsx$/
                    ),
                })
            );
            expect(mockTx.archivosTarea.create).toHaveBeenCalledWith({
                data: { archivoId: 2, tareaId: 7, orden: 0 },
            });
        });

        it('generates correct storage key for liquidacion parent type', async () => {
            const liqFile = makeFile({
                originalname: 'f-931.docx',
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const liqParent = { type: 'liquidacion' as const, id: 3 };
            mockStorage.put.mockResolvedValue({ key: 'estudios/1/liquidaciones/3/2026-06/uuid.docx' });
            mockTx.archivo.create.mockResolvedValue({ id: 3 });
            mockTx.archivosLiquidacion.create.mockResolvedValue({ archivoId: 3, liquidacionId: 3, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(liqFile, liqParent, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(
                        /^estudios\/1\/liquidaciones\/3\/2026-06\/[a-f0-9-]+\.docx$/
                    ),
                })
            );
            expect(mockTx.archivosLiquidacion.create).toHaveBeenCalledWith({
                data: { archivoId: 3, liquidacionId: 3, orden: 0 },
            });
        });

        it('falls back to bin extension when originalName has no extension', async () => {
            const noextFile = makeFile({
                originalname: 'README',
                mimetype: 'application/pdf',
            });
            mockStorage.put.mockResolvedValue({ key: 'estudios/1/clientes/42/2026-06/uuid.bin' });
            mockTx.archivo.create.mockResolvedValue({ id: 5 });
            mockTx.archivosCliente.create.mockResolvedValue({ archivoId: 5, clienteId: 42, orden: 0 });
            mockStorage.getSignedUrl.mockResolvedValue('https://signed.example.com');

            await service.create(noextFile, { type: 'cliente', id: 42 }, 'user-1');

            expect(mockStorage.put).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringMatching(/\.bin$/),
                })
            );
            expect(mockTx.archivo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ extension: 'bin' }),
                })
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

        it('throws 404 when archivo exists but R2 object is missing (NoSuchKey)', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            const noSuchKeyError = Object.assign(new Error('NoSuchKey'), {
                name: 'NoSuchKey',
            });
            mockStorage.getSignedUrl.mockRejectedValue(noSuchKeyError);

            await expect(service.findById(1)).rejects.toMatchObject({
                message: 'archivo.error.fileNotFound',
                status: 404,
            });
        });

        it('rethrows non-NoSuchKey storage errors as 500 (W8)', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            const networkError = new Error('Network timeout');
            mockStorage.getSignedUrl.mockRejectedValue(networkError);

            // Should propagate as-is (global exception filter maps to 500)
            await expect(service.findById(1)).rejects.toThrow('Network timeout');
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

        it('soft-deletes, removes R2 object, and deletes junctions in transaction', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockTx.archivo.update.mockResolvedValue({
                ...archivoRow,
                activo: false,
            });
            mockStorage.delete.mockResolvedValue(undefined);
            mockTx.archivosCliente.deleteMany.mockResolvedValue({ count: 1 });
            mockTx.archivosTarea.deleteMany.mockResolvedValue({ count: 0 });
            mockTx.archivosLiquidacion.deleteMany.mockResolvedValue({ count: 0 });

            const result = await service.delete(1);

            expect(mockStorage.delete).toHaveBeenCalledWith(
                archivoRow.storageKey
            );

            // Verify transaction was used for softDelete + deleteJunctions
            expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
            expect(mockTx.archivo.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { activo: false },
            });
            expect(mockTx.archivosCliente.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });
            expect(mockTx.archivosTarea.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });
            expect(mockTx.archivosLiquidacion.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });

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
            mockTx.archivo.update.mockResolvedValue({
                ...archivoRow,
                activo: false,
            });
            mockTx.archivosCliente.deleteMany.mockResolvedValue({ count: 1 });
            mockTx.archivosTarea.deleteMany.mockResolvedValue({ count: 0 });
            mockTx.archivosLiquidacion.deleteMany.mockResolvedValue({ count: 0 });
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

            // Transaction still executes
            expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                success: true,
                message: 'archivo.success.deleted',
            });

            loggerSpy.mockRestore();
        });

        it('rolls back softDelete when deleteJunctions fails in transaction (W9)', async () => {
            mockRepo.findById.mockResolvedValue(archivoRow);
            mockStorage.delete.mockResolvedValue(undefined);
            mockTx.archivo.update.mockResolvedValue({
                ...archivoRow,
                activo: false,
            });
            // Simulate: archivosCliente.deleteMany succeeds but archivosTarea fails
            mockTx.archivosCliente.deleteMany.mockResolvedValue({ count: 1 });
            const junctionError = new Error('DB connection lost');
            mockTx.archivosTarea.deleteMany.mockRejectedValue(junctionError);

            const loggerSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();

            // Transaction should throw, and the outer catch in delete() should catch it
            // But current delete() doesn't catch transaction errors — it lets them propagate
            // This test verifies that the transaction throws (rollback happens at DB level)
            await expect(service.delete(1)).rejects.toThrow('DB connection lost');

            // softDelete was called inside the transaction (which failed and rolled back)
            expect(mockTx.archivo.update).toHaveBeenCalledTimes(1);
            expect(mockTx.archivosCliente.deleteMany).toHaveBeenCalledTimes(1);
            expect(mockTx.archivosTarea.deleteMany).toHaveBeenCalledTimes(1);
            // archivosLiquidacion should NOT have been called (transaction aborted early)
            expect(mockTx.archivosLiquidacion.deleteMany).not.toHaveBeenCalled();

            loggerSpy.mockRestore();
        });
    });
});
