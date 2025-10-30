import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggingService } from '@logging/logging.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly loggingService: LoggingService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        this.loggingService.debug(`Query: ${e.query}`, 'PrismaService');
        this.loggingService.debug(`Duration: ${e.duration}ms`, 'PrismaService');
      });
    }

    this.$on('error', (e) => {
      this.loggingService.error(`Database Error: ${e.message}`, e.target, 'PrismaService');
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.loggingService.log('✅ Database connected successfully', 'PrismaService');
    } catch (error) {
      this.loggingService.error('❌ Failed to connect to database', error, 'PrismaService');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.loggingService.log('📴 Database disconnected', 'PrismaService');
  }

  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
