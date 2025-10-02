import { AssignCategoriesDto } from '@libs/dto/categories';

export class AssignCategoriesToIncidentReportCommand {
  constructor(
    public readonly incidentReportId: string,
    public readonly dto: AssignCategoriesDto,
    public readonly assignedBy: string,
  ) {}
}
