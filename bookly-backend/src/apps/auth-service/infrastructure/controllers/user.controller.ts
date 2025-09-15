import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from '@libs/dto/auth/user-operations.dto';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { GetUsersQuery } from '../../application/queries/get-users.query';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { DeleteUserCommand } from '../../application/commands/delete-user.command';
import { AssignRoleCommand } from '../../application/commands/assign-role.command';
import { RemoveRoleCommand } from '../../application/commands/remove-role.command';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { AUTH_URLS } from '../../utils/maps';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(AUTH_URLS.USER)
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(AUTH_URLS.USER_FIND)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: PaginatedResponseDto
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.queryBus.execute(new GetUsersQuery(page, limit, search));
    return ResponseUtil.fromServiceResponse({
      items: result.users,
      total: result.total,
      page: page || 1,
      limit: limit || 20,
      message: 'Users retrieved successfully'
    });
  }

  @Get(AUTH_URLS.USER_FIND_BY_ID)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string) {
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return ResponseUtil.success(user, 'User retrieved successfully');
  }

  @Put(AUTH_URLS.USER_UPDATE)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: SuccessResponseDto
  })
  async update(@Param('id') id: string, @Body() data: UpdateUserDto, @CurrentUser() currentUser: UserEntity) {
    const user = await this.commandBus.execute(new UpdateUserCommand(id, data, currentUser.id));
    return ResponseUtil.success(user, 'User updated successfully');
  }

  @Delete(AUTH_URLS.USER_DELETE)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    type: SuccessResponseDto
  })
  async delete(@Param('id') id: string, @CurrentUser() currentUser: UserEntity) {
    await this.commandBus.execute(new DeleteUserCommand(id, currentUser.id));
    return ResponseUtil.success(null, 'User deleted successfully');
  }

  @Put(AUTH_URLS.USER_ASSIGN_ROLE)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role assigned successfully',
    type: SuccessResponseDto
  })
  async assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string, @CurrentUser() currentUser: UserEntity) {
    await this.commandBus.execute(new AssignRoleCommand(userId, roleId, currentUser.id));
    return ResponseUtil.success(null, 'Role assigned successfully');
  }

  @Delete(AUTH_URLS.USER_REMOVE_ROLE)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role removed successfully',
    type: SuccessResponseDto
  })
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string, @CurrentUser() currentUser: UserEntity) {
    await this.commandBus.execute(new RemoveRoleCommand(userId, roleId, currentUser.id));
    return ResponseUtil.success(null, 'Role removed successfully');
  }
}
