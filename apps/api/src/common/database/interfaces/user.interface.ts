import type { User } from '@prisma/client';

import type { UserRole } from '../enums/role.enum';

export type UserEntity = User;

export interface CreateUserInput {
    email: string;
    nombre: string;
    password: string;
    role: UserRole;
    emoji?: string | null;
    telefono?: string | null;
    telegramChatId?: string | null;
    googleTokens?: Record<string, unknown> | null;
    estudioId?: number;
}

export interface UpdateUserInput {
    email?: string;
    nombre?: string;
    role?: UserRole;
    emoji?: string | null;
    telefono?: string | null;
    telegramChatId?: string | null;
    googleTokens?: Record<string, unknown> | null;
    estudioId?: number;
    activo?: boolean;
}
