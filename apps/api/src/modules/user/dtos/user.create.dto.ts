import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

import { UserRole } from 'src/common/database/enums/role.enum';

export class UserCreateDto {
    @ApiProperty({
        example: faker.internet.email(),
    })
    @IsEmail()
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @ApiProperty({
        example: faker.person.fullName(),
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    nombre: string;

    @ApiProperty({
        example: 'MiClaveSegura123!',
        description: 'Contraseña para el usuario (mínimo 8 caracteres)',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.COLABORADOR,
        description: 'Rol del usuario: SOCIO (acceso total) o COLABORADOR (solo sus datos)',
    })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({
        example: '👤',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    @Transform(({ value }) => value?.trim())
    emoji?: string;

    @ApiProperty({
        example: '+54 11 1234-5678',
        required: false,
    })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    telefono?: string;
}
