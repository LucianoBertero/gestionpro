import {
    Allow,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Validate,
    ValidatorConstraint,
    type ValidatorConstraintInterface,
    type ValidationArguments,
} from 'class-validator';

import { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

const VALID_PARENT_TYPES = ['cliente', 'tarea', 'liquidacion', 'estudio'] as const;

/**
 * Custom validator: checks that the parent JSON string is a valid
 * ArchivoParent:
 * - Valid JSON object
 * - `type` is one of the valid parent types
 * - Object shape:
 *   - For 'cliente' | 'tarea' | 'liquidacion': must have `id` as a positive integer
 *   - For 'estudio': `id` is optional (ignored if present)
 */
@ValidatorConstraint({ name: 'isValidParentJson' })
class IsValidParentJson implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        if (typeof value !== 'string' || value.trim() === '') return false;

        let obj: Record<string, unknown>;
        try {
            obj = JSON.parse(value);
        } catch {
            return false;
        }

        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;

        if (!VALID_PARENT_TYPES.includes(obj.type as typeof VALID_PARENT_TYPES[number])) return false;

        // For non-estudio types, require a valid positive integer id
        if (obj.type !== 'estudio') {
            const id = obj.id;
            if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return false;
        }

        return true;
    }

    defaultMessage(_args: ValidationArguments): string {
        return 'archivo.error.invalidParent';
    }
}

/**
 * DTO for multipart form body fields in POST /v1/archivos.
 *
 * The actual file is handled by `@UploadedFile()` and `FileValidationPipe`.
 */
export class ArchivoParentDto {
    @IsString({ message: 'archivo.error.invalidParent' })
    @IsNotEmpty({ message: 'archivo.error.invalidParent' })
    @Validate(IsValidParentJson, { message: 'archivo.error.invalidParent' })
    parent!: string;

    @IsOptional()
    @IsEnum(TipoArchivo, { message: 'archivo.error.invalidTipo' })
    tipo?: TipoArchivo;

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'archivo.error.invalidPeriodo' })
    periodo?: string;

    /** Multipart `file` field — handled by `@UploadedFile()`. @Allow bypasses forbidNonWhitelisted. */
    @Allow()
    file?: unknown;
}
