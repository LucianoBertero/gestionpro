import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { UserRepository } from 'src/common/database/repositories/user.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import {
    UserGetProfileResponseDto,
    UserUpdateProfileResponseDto,
    UserResponseDto,
} from '../dtos/user.dto';
import { UserCreateDto } from '../dtos/user.create.dto';
import { UserUpdateDto } from '../dtos/user.update.dto';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async findAll(): Promise<UserResponseDto[]> {
        return this.userRepository.findAll();
    }

    async findById(userId: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        return user;
    }

    async getProfile(userId: string): Promise<UserGetProfileResponseDto> {
        return this.findById(userId);
    }

    async createUser(data: UserCreateDto): Promise<UserResponseDto> {
        if (await this.userRepository.existsByEmail(data.email)) {
            throw new HttpException(
                'user.error.userExists',
                HttpStatus.CONFLICT
            );
        }

        const hashed = await argon2.hash(data.password);
        return this.userRepository.create({
            email: data.email,
            nombre: data.nombre,
            password: hashed,
            role: data.role,
            emoji: data.emoji ?? '👤',
            telefono: data.telefono ?? null,
        });
    }

    async updateUser(
        userId: string,
        data: UserUpdateDto
    ): Promise<UserUpdateProfileResponseDto> {
        await this.assertExists(userId);
        return this.userRepository.update(userId, data);
    }

    async deleteUser(userId: string): Promise<ApiGenericResponseDto> {
        await this.assertExists(userId);
        await this.userRepository.softDelete(userId);
        return { success: true, message: 'user.success.userDeleted' };
    }

    private async assertExists(userId: string): Promise<void> {
        const exists = await this.userRepository.existsById(userId);
        if (!exists) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }
    }
}
