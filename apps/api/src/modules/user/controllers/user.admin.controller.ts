import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { UserResponseDto } from '../dtos/user.dto';
import { UserCreateDto } from '../dtos/user.create.dto';
import { UserUpdateDto } from '../dtos/user.update.dto';
import { UserService } from '../services/user.service';

@ApiTags('admin.user')
@ApiBearerAuth('accessToken')
@Controller({ path: '/admin/user', version: '1' })
export class UserAdminController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiEndpoint({
        summary: 'List all users (SOCIO only)',
        messageKey: 'user.success.list',
    })
    findAll(): Promise<UserResponseDto[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiEndpoint({
        summary: 'Get user by ID (SOCIO only)',
        messageKey: 'user.success.profile',
    })
    findById(@Param('id') userId: string): Promise<UserResponseDto> {
        return this.userService.findById(userId);
    }

    @Post()
    @ApiEndpoint({
        summary: 'Create new user (SOCIO only)',
        serialization: UserResponseDto,
        httpStatus: HttpStatus.CREATED,
        messageKey: 'user.success.created',
    })
    createUser(@Body() data: UserCreateDto): Promise<UserResponseDto> {
        return this.userService.createUser(data);
    }

    @Patch(':id')
    @ApiEndpoint({
        summary: 'Update user (SOCIO only)',
        messageKey: 'user.success.updated',
    })
    updateUser(
        @Param('id') userId: string,
        @Body() data: UserUpdateDto
    ): Promise<UserResponseDto> {
        return this.userService.updateUser(userId, data);
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: 'Delete user (soft delete)',
        messageKey: 'user.success.deleted',
    })
    deleteUser(@Param('id') userId: string): Promise<ApiGenericResponseDto> {
        return this.userService.deleteUser(userId);
    }
}
