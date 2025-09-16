import { RemoveCategoriesDto } from '@libs/dto/categories';

export class RemoveCategoriesFromIncidentReportCommand {
  constructor(
    public readonly incidentReportId: string,
    public readonly dto: RemoveCategoriesDto,
    public readonly removedBy: string,
  ) {}
}
