import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiGatewayService } from '../../application/services/api-gateway.service';

@ApiTags('API Gateway')
@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information retrieved successfully' })
  async getApiInfo() {
    return this.apiGatewayService.getApiInfo();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'API status retrieved successfully' })
  async getHealthStatus() {
    return this.apiGatewayService.getHealthStatus();
  }

  @Get('rate-limit')
  @ApiOperation({ summary: 'Get rate limit information' })
  @ApiResponse({ status: 200, description: 'Rate limit information retrieved successfully' })
  async getRateLimitInfo() {
    return this.apiGatewayService.getRateLimitInfo();
  }
}
