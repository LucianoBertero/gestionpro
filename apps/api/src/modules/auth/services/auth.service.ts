import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';

import { UserRole } from 'src/common/database/enums/role.enum';
import { RefreshTokenRepository } from 'src/common/database/repositories/refresh-token.repository';
import { UserRepository } from 'src/common/database/repositories/user.repository';
import { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { UserLoginDto } from '../dtos/auth.login.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
    TokenDto,
} from '../dtos/auth.response.dto';
import { UserCreateDto } from '../dtos/auth.signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async login({ email, password }: UserLoginDto): Promise<AuthResponseDto> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }

        const matched = await argon2.verify(user.passwordHash, password);
        if (!matched) {
            throw new HttpException(
                'auth.error.invalidPassword',
                HttpStatus.BAD_REQUEST
            );
        }

        const payload: IAuthUser = { userId: user.id, role: user.role };
        const tokens = await this.signTokens(payload);

        const refreshHash = this.hashToken(tokens.refreshToken);
        const expira = this.refreshTokenExpiry();
        await this.refreshTokenRepository.create(
            user.id,
            refreshHash,
            expira
        );

        return { ...tokens, user };
    }

    async signup(data: UserCreateDto): Promise<AuthResponseDto> {
        if (await this.userRepository.existsByEmail(data.email)) {
            throw new HttpException(
                'user.error.userExists',
                HttpStatus.CONFLICT
            );
        }

        const hashed = await argon2.hash(data.password);
        const user = await this.userRepository.create({
            email: data.email,
            password: hashed,
            nombre: data.nombre.trim(),
            role: UserRole.COLABORADOR,
            emoji: data.emoji?.trim() ?? null,
            estudioId: 1,
        });

        const payload: IAuthUser = { userId: user.id, role: user.role };
        const tokens = await this.signTokens(payload);

        const refreshHash = this.hashToken(tokens.refreshToken);
        const expira = this.refreshTokenExpiry();
        await this.refreshTokenRepository.create(
            user.id,
            refreshHash,
            expira
        );

        return { ...tokens, user };
    }

    async refreshTokens(
        user: IAuthUser,
        rawToken: string
    ): Promise<TokenDto & { refreshTokenRaw: string }> {
        const tokenHash = this.hashToken(rawToken);
        const stored = await this.refreshTokenRepository.findByToken(tokenHash);

        if (!stored || stored.revocado || stored.expira < new Date()) {
            throw new HttpException(
                'auth.error.refreshTokenInvalid',
                HttpStatus.UNAUTHORIZED
            );
        }

        // Rotate: revoke old token
        await this.refreshTokenRepository.revoke(stored.token);

        // Issue new pair
        const payload: IAuthUser = { userId: user.userId, role: user.role };
        const newTokens = await this.signTokens(payload);

        const newHash = this.hashToken(newTokens.refreshToken);
        const expira = this.refreshTokenExpiry();
        await this.refreshTokenRepository.create(
            user.userId,
            newHash,
            expira
        );

        return { ...newTokens, refreshTokenRaw: newTokens.refreshToken };
    }

    async logout(userId: string): Promise<void> {
        await this.refreshTokenRepository.revokeAll(userId);
    }

    private async signTokens(payload: IAuthUser): Promise<TokenDto> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, this.signOptions('accessToken')),
            this.jwtService.signAsync(
                { ...payload, jti: randomUUID() },
                this.signOptions('refreshToken')
            ),
        ]);
        return { accessToken, refreshToken };
    }

    private signOptions(kind: 'accessToken' | 'refreshToken'): JwtSignOptions {
        return {
            secret: this.configService.getOrThrow<string>(
                `auth.${kind}.secret`
            ),
            expiresIn: this.configService.getOrThrow<string>(
                `auth.${kind}.tokenExp`
            ),
        } as JwtSignOptions;
    }

    private refreshTokenExpiry(): Date {
        const expStr = this.configService.getOrThrow<string>(
            'auth.refreshToken.tokenExp'
        );
        const seconds = this.parseExpirySeconds(expStr);
        return new Date(Date.now() + seconds * 1000);
    }

    private parseExpirySeconds(exp: string): number {
        const match = exp.match(/^(\d+)\s*(s|m|h|d)$/);
        if (!match) {
            // Default: 7 days in seconds
            return 7 * 24 * 60 * 60;
        }
        const value = parseInt(match[1], 10);
        switch (match[2]) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
            default:
                return value;
        }
    }

    /**
     * Deterministic SHA-256 hash for refresh token lookup.
     * Argon2 is NOT suitable here because it uses a random salt,
     * making `findUnique({ where: { token } })` impossible.
     */
    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
