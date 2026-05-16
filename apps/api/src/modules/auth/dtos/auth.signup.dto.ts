import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

import { UserLoginDto } from './auth.login.dto';

export class UserCreateDto extends UserLoginDto {
    @ApiProperty({
        example: faker.person.fullName(),
        required: true,
    })
    @IsString()
    @Length(1, 100)
    public nombre: string;

    @ApiProperty({
        example: '👤',
        required: false,
    })
    @IsString()
    @IsOptional()
    @Length(1, 10)
    public emoji?: string;
}
