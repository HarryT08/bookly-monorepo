export interface ReportExportsRepository {
  saveExport(exportData: {
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    columns: string[];
    customHeaders?: string[];
    includeMetadata: boolean;
    delimiter: string;
    exportedBy: string;
    expiresAt: Date;
    sendByEmail?: boolean;
    emailAddress?: string;
  }): Promise<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    exportedBy: string;
    createdAt: Date;
    expiresAt: Date;
  }>;

  findById(id: string): Promise<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    exportedBy: string;
    createdAt: Date;
    expiresAt: Date;
  } | null>;

  findByUserId(userId: string, limit?: number): Promise<Array<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    fileSize: number;
    createdAt: Date;
    expiresAt: Date;
  }>>;

  deleteExpired(): Promise<number>;
}
