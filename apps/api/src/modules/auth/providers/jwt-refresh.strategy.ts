import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

function refreshTokenExtractor(req: Request): string | null {
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
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh'
) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: refreshTokenExtractor,
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>(
                'auth.refreshToken.secret'
            ),
        });
    }

    validate(payload: Record<string, string | number>) {
        return payload;
    }
}
