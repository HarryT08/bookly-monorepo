import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthCategoryService } from '../../application/services/category.service';
import { LoggingService } from '@libs/logging/logging.service';

@ApiTags('Auth Categories')
@Controller('auth/categories')
export class AuthCategoryController {
  constructor(
    private readonly categoryService: AuthCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all role categories' })
  @ApiResponse({ status: 200, description: 'Role categories retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    try {
      const categories = await this.categoryService.findAll({
        page: page || 1,
        limit: limit || 10,
        search,
      });

      this.loggingService.log('Role categories retrieved successfully', {
        count: categories.data.length,
        page: categories.pagination.page,
        search,
      });

      return categories;
    } catch (error) {
      this.loggingService.error('Failed to retrieve role categories', error);
      throw error;
    }
  }

  @Get('defaults')
  @ApiOperation({ summary: 'Get default role categories' })
  @ApiResponse({ status: 200, description: 'Default role categories retrieved successfully' })
  async getDefaults() {
    try {
      const categories = await this.categoryService.findDefaults();
      
      this.loggingService.log('Default role categories retrieved successfully', {
        count: categories.length,
      });

      return categories;
    } catch (error) {
      this.loggingService.error('Failed to retrieve default role categories', error);
      throw error;
    }
  }
}
