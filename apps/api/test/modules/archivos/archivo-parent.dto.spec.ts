import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ArchivoParentDto } from 'src/modules/archivos/dtos/archivo-parent.dto';

describe('ArchivoParentDto', () => {
    it('validates a correct cliente parent JSON string', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":42}',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.parent).toBe('{"type":"cliente","id":42}');
    });

    it('validates a correct tarea parent with optional orden', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"tarea","id":7,"orden":1}',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('validates a correct liquidacion parent', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"liquidacion","id":3}',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects missing parent field', async () => {
        const dto = plainToInstance(ArchivoParentDto, {});
        const errors = await validate(dto);

        const parentErrors = errors.filter((e) => e.property === 'parent');
        expect(parentErrors.length).toBeGreaterThan(0);
    });

    it('rejects empty parent string', async () => {
        const dto = plainToInstance(ArchivoParentDto, { parent: '' });
        const errors = await validate(dto);
        const parentErrors = errors.filter((e) => e.property === 'parent');
        expect(parentErrors.length).toBeGreaterThan(0);
    });

    it('rejects invalid tipo enum', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":42}',
            tipo: 'INVALID',
        });

        const errors = await validate(dto);
        const tipoErrors = errors.filter((e) => e.property === 'tipo');
        expect(tipoErrors.length).toBeGreaterThan(0);
    });

    it('rejects non-JSON parent string', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: 'not-json',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent without type field', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"id":42}',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent with invalid type value', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"foo","id":42}',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent with non-numeric id', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":"not-a-number"}',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent with missing id', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente"}',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent with zero or negative id', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":0}',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects parent that is an array (not object)', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '[{"type":"cliente","id":42}]',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('accepts optional tipo and periodo', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":42}',
            tipo: 'DDJJ',
            periodo: '2026-05',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.tipo).toBe('DDJJ');
        expect(dto.periodo).toBe('2026-05');
    });

    it('accepts extra file field from multipart upload', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":42}',
            tipo: 'DDJJ',
            periodo: '2026-05',
            file: { fieldname: 'file', originalname: 'test.pdf', mimetype: 'application/pdf' },
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects invalid periodo format', async () => {
        const dto = plainToInstance(ArchivoParentDto, {
            parent: '{"type":"cliente","id":42}',
            periodo: '2026-5',
        });

        const errors = await validate(dto);
        const periodoErrors = errors.filter((e) => e.property === 'periodo');
        expect(periodoErrors.length).toBeGreaterThan(0);
    });
});
