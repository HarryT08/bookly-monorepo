import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesController } from './services.controller';
import { OrchestratorService } from './services/orchestrator.service';
import configuration from '../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController, ServicesController],
  providers: [AppService, OrchestratorService],
})
export class AppModule {}
