import { PrismaService } from "@common/services/prisma.service";
import { PrismaCategoryRepository } from "@libs/common/repositories/prisma-category.repository";
import { EventBusService } from "@libs/event-bus/services/event-bus.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryUserGroupRepository extends PrismaCategoryRepository {
  constructor(
    protected prisma: PrismaService,
    protected eventBus: EventBusService
  ) {
    super(prisma, eventBus, "auth-service", "USER", "GROUP");
  }
}
