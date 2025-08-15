import { SeedService } from '@/libs/common/services/seed.service';
import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('status')
  @ApiOperation({ 
    summary: 'Check if database needs seeding',
    description: 'Returns whether the database is empty and needs initial seeding'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Database seeding status',
    schema: {
      type: 'object',
      properties: {
        needsSeeding: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async checkSeedingStatus() {
    const needsSeeding = await this.seedService.needsSeeding();
    
    return {
      needsSeeding,
      message: needsSeeding 
        ? 'Database is empty and needs seeding' 
        : 'Database already contains data'
    };
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Run database seeding',
    description: 'Initializes the database with basic data if it is empty. This includes programs, roles, permissions, users, categories, maintenance types, resources, and basic availability.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Seeding completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            programs: { type: 'number' },
            roles: { type: 'number' },
            users: { type: 'number' },
            categories: { type: 'number' },
            maintenanceTypes: { type: 'number' },
            resources: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Seeding failed or database already contains data' 
  })
  async runSeeding() {
    return await this.seedService.runSeeding();
  }

  @Post('run-full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Run full database seeding (force mode)',
    description: 'Clears all existing data and reinitializes the database with fresh data. WARNING: This will delete all existing data including users, roles, resources, etc.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Full seeding completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            programs: { type: 'number' },
            roles: { type: 'number' },
            users: { type: 'number' },
            categories: { type: 'number' },
            maintenanceTypes: { type: 'number' },
            resources: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Full seeding failed' 
  })
  async runFullSeeding() {
    return await this.seedService.runFullSeeding();
  }
}
