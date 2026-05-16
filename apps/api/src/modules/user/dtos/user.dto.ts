import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

import { UserRole } from 'src/common/database/enums/role.enum';
import type { UserEntity } from 'src/common/database/interfaces/user.interface';

export class UserResponseDto {
    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: faker.person.fullName(),
    })
    @Expose()
    @IsString()
    nombre: string;

    @ApiProperty({
        example: faker.internet.email(),
    })
    @Expose()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '👤',
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    emoji: string | null;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    telefono: string | null;

    @ApiProperty({
        example: faker.string.numeric(10),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    telegramChatId: string | null;

    @ApiProperty({
        example: 1,
    })
    @Expose()
    @IsInt()
    estudioId: number;

    @ApiProperty({
        example: {},
        required: false,
        nullable: true,
    })
    @Expose()
    @IsOptional()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    googleTokens: any;

    @ApiProperty({
        enum: UserRole,
        example: faker.helpers.arrayElement(Object.values(UserRole)),
    })
    @Expose()
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({
        example: true,
    })
    @Expose()
    @IsBoolean()
    activo: boolean;

    @ApiProperty({
        example: faker.date.past().toISOString(),
    })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({
        example: faker.date.recent().toISOString(),
    })
    @Expose()
    @IsDate()
    updatedAt: Date;

    @ApiHideProperty()
    @Exclude()
    passwordHash: string;
}

export class UserGetProfileResponseDto extends UserResponseDto {}

export class UserUpdateProfileResponseDto extends UserResponseDto {}
