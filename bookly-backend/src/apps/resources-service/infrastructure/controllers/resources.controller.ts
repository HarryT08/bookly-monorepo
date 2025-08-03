import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourcesService } from '../../application/services/resources.service';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findById(@Param('id') id: string) {
    return this.resourcesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async create(@Body() data: any) {
    return this.resourcesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resource' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.resourcesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.resourcesService.delete(id);
  }
}
