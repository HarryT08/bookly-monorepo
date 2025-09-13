import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
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
  @ApiResponse({ 
    status: 200, 
    description: 'Role categories retrieved successfully',
    type: PaginatedResponseDto
  })
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

      return ResponseUtil.paginated(
        categories.data,
        categories.pagination.total,
        categories.pagination.page,
        categories.pagination.limit,
        'Role categories retrieved successfully'
      );
    } catch (error) {
      this.loggingService.error('Failed to retrieve role categories', error);
      throw error;
    }
  }

  @Get('defaults')
  @ApiOperation({ summary: 'Get default role categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'Default role categories retrieved successfully',
    type: SuccessResponseDto
  })
  async getDefaults() {
    try {
      const categories = await this.categoryService.findDefaults();
      
      this.loggingService.log('Default role categories retrieved successfully', {
        count: categories.length,
      });

      return ResponseUtil.success(categories, 'Default role categories retrieved successfully');
    } catch (error) {
      this.loggingService.error('Failed to retrieve default role categories', error);
      throw error;
    }
  }
}
