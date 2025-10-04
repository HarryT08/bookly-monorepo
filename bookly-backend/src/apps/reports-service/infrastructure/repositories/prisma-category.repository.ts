/**
 * Prisma Category Repository Implementation for Reports Service
 * Implements the CategoryRepository interface using Prisma ORM
 */

import { CategoryEntity } from "@libs/common/entities/category.entity";
import { PrismaCategoryRepository as BaseCategoryRepository } from "@libs/common/repositories/prisma-category.repository";
import { PrismaService } from "@libs/common/services/prisma.service";
import { EventBusService } from "@libs/event-bus/services/event-bus.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaCategoryRepository extends BaseCategoryRepository {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly eventBus: EventBusService
  ) {
    super(prisma, eventBus, "reports-service", "REPORT", "CATEGORY");
  }
}
