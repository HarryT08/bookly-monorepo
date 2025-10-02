import { IQuery } from '@nestjs/cqrs';
import { ExportCsvDto } from '@dto/reports/export-csv.dto';

/**
 * RF-33: Query for exporting reports to CSV and other formats
 */
export class ExportReportQuery implements IQuery {
  constructor(
    public readonly exportConfig: ExportCsvDto,
    public readonly reportData: any,
    public readonly userId: string,
    public readonly userRoles: string[],
    public readonly requestId?: string,
  ) {}
}

/**
 * Query for getting export history
 */
export class ExportHistoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly reportType?: string,
    public readonly limit?: number,
  ) {}
}

/**
 * Query for downloading an exported file
 */
export class DownloadExportQuery implements IQuery {
  constructor(
    public readonly exportId: string,
    public readonly userId: string,
    public readonly userRoles: string[],
  ) {}
}

/**
 * Query for getting cached report
 */
export class CachedReportQuery implements IQuery {
  constructor(
    public readonly cacheKey: string,
    public readonly userId: string,
    public readonly userRoles: string[],
  ) {}
}
