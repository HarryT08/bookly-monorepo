import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { GetUsersQuery } from '../../application/queries/get-users.query';
import { UserService } from '../../application/services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AUTH_URLS } from '../../utils/maps';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(AUTH_URLS.USER)
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly userService: UserService,
  ) {}

  @Get(AUTH_URLS.USER_FIND)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.queryBus.execute(new GetUsersQuery(page, limit, search));
  }

  @Get(AUTH_URLS.USER_FIND_BY_ID)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Put(AUTH_URLS.USER_UPDATE)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Delete(AUTH_URLS.USER_DELETE)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Put(AUTH_URLS.USER_ASSIGN_ROLE)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userService.assignRole(userId, roleId);
  }

  @Delete(AUTH_URLS.USER_REMOVE_ROLE)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userService.removeRole(userId, roleId);
  }
}
