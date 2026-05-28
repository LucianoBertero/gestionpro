import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { UserRole } from 'src/common/database/enums/role.enum';
import { UserRepository } from 'src/common/database/repositories/user.repository';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import { PublicRoute } from 'src/common/request/decorators/public.decorator';
import { AllowedRoles } from 'src/common/request/decorators/roles.decorator';
import { JwtRefreshGuard } from 'src/common/request/guards/jwt-refresh.guard';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import { UserLoginDto } from '../dtos/auth.login.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
} from '../dtos/auth.response.dto';
import { UserCreateDto } from '../dtos/auth.signup.dto';
import { AuthService } from '../services/auth.service';

function extractRefreshToken(req: Request): string | null {
    // Try cookie first
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)refreshToken=([^;]*)/);
        if (match?.[1]) return decodeURIComponent(match[1]);
    }
    // Try x-refresh-token header
    const headerToken = req.headers['x-refresh-token'];
    if (typeof headerToken === 'string') return headerToken;
    if (Array.isArray(headerToken) && typeof headerToken[0] === 'string')
        return headerToken[0];
    // Fallback to Authorization Bearer
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

function setRefreshCookie(res: Response, token: string): void {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const secure = process.env.APP_ENV === 'production' ? '; Secure' : '';
    const sameSite = process.env.APP_ENV === 'production' ? '; SameSite=None' : '; SameSite=Lax';
    res.setHeader(
        'Set-Cookie',
        `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${maxAge}${sameSite}${secure}`
    );
}

function clearRefreshCookie(res: Response): void {
    const sameSite = process.env.APP_ENV === 'production' ? '; SameSite=None' : '; SameSite=Lax';
    res.setHeader(
        'Set-Cookie',
        `refreshToken=; HttpOnly; Path=/; Max-Age=0${sameSite}`
    );
}

@ApiTags('public.auth')
@Controller({ path: '/auth', version: '1' })
export class AuthPublicController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository
    ) {}

    @Post('login')
    @PublicRoute()
    @ApiEndpoint({
        summary: 'User login',
        serialization: AuthResponseDto,
        messageKey: 'auth.success.loggedIn',
    })
    async login(
        @Body() payload: UserLoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<AuthResponseDto> {
        const result = await this.authService.login(payload);
        setRefreshCookie(res, result.refreshToken);
        return result;
    }

    @Post('signup')
    @ApiBearerAuth('accessToken')
    @ApiEndpoint({
        summary: 'Create user (MVP: all authenticated users)',
        serialization: AuthResponseDto,
        httpStatus: HttpStatus.CREATED,
        messageKey: 'auth.success.signedUp',
    })
    async signup(
        @Body() payload: UserCreateDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<AuthResponseDto> {
        const result = await this.authService.signup(payload);
        setRefreshCookie(res, result.refreshToken);
        return result;
    }

    @Get('refresh-token')
    @PublicRoute()
    @UseGuards(JwtRefreshGuard)
    @ApiBearerAuth('refreshToken')
    @ApiEndpoint({
        summary: 'Refresh tokens',
        serialization: AuthRefreshResponseDto,
        messageKey: 'auth.success.tokensRefreshed',
    })
    async refreshTokens(
        @AuthUser() user: IAuthUser,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<AuthRefreshResponseDto> {
        const rawToken = extractRefreshToken(req);
        if (!rawToken) {
            throw new HttpException(
                'auth.error.refreshTokenMissing',
                HttpStatus.BAD_REQUEST
            );
        }
        const result = await this.authService.refreshTokens(user, rawToken);
        setRefreshCookie(res, result.refreshTokenRaw);
        return { accessToken: result.accessToken };
    }

    @Get('users')
    @PublicRoute()
    @ApiEndpoint({
        summary: 'List active users for login selector',
        messageKey: 'auth.success.usersListed',
    })
    async getActiveUsers(): Promise<{ id: string; nombre: string; emoji: string | null; email: string }[]> {
        const users = await this.userRepository.findAll();
        return users.map(u => ({
            id: u.id,
            nombre: u.nombre,
            emoji: u.emoji,
            email: u.email,
        }));
    }

    @Post('logout')
    @ApiBearerAuth('accessToken')
    @ApiEndpoint({
        summary: 'User logout',
        messageKey: 'auth.success.loggedOut',
    })
    async logout(
        @AuthUser() user: IAuthUser,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ success: boolean }> {
        await this.authService.logout(user.userId);
        clearRefreshCookie(res);
        return { success: true };
    }
}
