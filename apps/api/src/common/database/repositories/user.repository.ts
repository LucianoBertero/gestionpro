import { Injectable } from '@nestjs/common';

import type {
    CreateUserInput,
    UpdateUserInput,
    UserEntity,
} from 'src/common/database/interfaces/user.interface';

import { DatabaseService } from '../services/database.service';

@Injectable()
export class UserRepository {
    constructor(private readonly db: DatabaseService) {}

    findById(id: string): Promise<UserEntity | null> {
        return this.db.user.findUnique({ where: { id } });
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.db.user.findUnique({ where: { email } });
    }

    findByEmoji(emoji: string): Promise<UserEntity | null> {
        return this.db.user.findFirst({ where: { emoji } });
    }

    findAll(): Promise<UserEntity[]> {
        return this.db.user.findMany({ where: { activo: true } });
    }

    async existsById(id: string): Promise<boolean> {
        const found = await this.db.user.findUnique({
            where: { id },
            select: { id: true },
        });
        return found !== null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const found = await this.db.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return found !== null;
    }

    create(data: CreateUserInput): Promise<UserEntity> {
        const { password, ...rest } = data;
        return this.db.user.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { ...rest, passwordHash: password } as any,
        });
    }

    update(id: string, data: UpdateUserInput): Promise<UserEntity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.db.user.update({ where: { id }, data: data as any });
    }

    softDelete(id: string): Promise<UserEntity> {
        return this.db.user.update({
            where: { id },
            data: { activo: false },
        });
    }

    async hardDeleteByEmail(email: string): Promise<number> {
        const result = await this.db.user.deleteMany({ where: { email } });
        return result.count;
    }
}
