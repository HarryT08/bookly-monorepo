import { Module } from '@nestjs/common';
import { ApiGatewayController } from './infrastructure/controllers/api-gateway.controller';
import { ApiGatewayService } from './application/services/api-gateway.service';

@Module({
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
  exports: [ApiGatewayService],
})
export class ApiGatewayModule {}
