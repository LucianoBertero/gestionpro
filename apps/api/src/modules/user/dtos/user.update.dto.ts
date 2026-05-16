import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UserRole } from 'src/common/database/enums/role.enum';

export class UserUpdateDto {
    @ApiProperty({
        example: faker.internet.email(),
        required: false,
    })
    @IsEmail()
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiProperty({
        example: faker.person.fullName(),
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    nombre?: string;

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
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    telefono?: string;

    @ApiProperty({
        enum: UserRole,
        example: faker.helpers.arrayElement(Object.values(UserRole)),
        required: false,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
