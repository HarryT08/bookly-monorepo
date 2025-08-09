import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationMetaDto } from "@dto/common/pagination-meta.dto";

/**
 * Base response structure for all reports
 */
export class ReportMetadataDto {
  @ApiProperty({
    description: 'Report generation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  generatedAt: string;

  @ApiProperty({
    description: 'User who generated the report',
    example: 'admin@ufps.edu.co',
  })
  generatedBy: string;

  @ApiProperty({
    description: 'Report type',
    example: 'USAGE_REPORT',
  })
  reportType: string;

  @ApiPropertyOptional({
    description: 'Filters applied to generate this report',
    type: 'object',
  })
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Total number of records in the report',
    example: 150,
  })
  totalRecords: number;

  @ApiProperty({
    description: 'Report generation time in milliseconds',
    example: 1250,
  })
  executionTime: number;
}

/**
 * RF-31: Usage report data structure
 */
export class UsageReportDataDto {
  @ApiProperty({
    description: 'Resource information',
    example: {
      id: '60f7b3b3b3b3b3b3b3b3b3b3',
      name: 'Aula Magna',
      code: 'AM-001',
      type: 'AUDITORIUM',
      capacity: 200,
    },
  })
  resource: {
    id: string;
    name: string;
    code: string;
    type: string;
    capacity?: number;
  };

  @ApiPropertyOptional({
    description: 'Academic program information',
    example: {
      id: '60f7b3b3b3b3b3b3b3b3b3b4',
      name: 'Ingeniería de Sistemas',
      code: 'IS',
    },
  })
  program?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional({
    description: 'Subject/course information',
    example: 'Programación Web Avanzada',
  })
  subject?: string;

  @ApiProperty({
    description: 'Total number of reservations',
    example: 25,
  })
  totalReservations: number;

  @ApiProperty({
    description: 'Number of confirmed reservations',
    example: 22,
  })
  confirmedReservations: number;

  @ApiProperty({
    description: 'Number of cancelled reservations',
    example: 3,
  })
  cancelledReservations: number;

  @ApiProperty({
    description: 'Total hours reserved',
    example: 75.5,
  })
  totalHours: number;

  @ApiProperty({
    description: 'Utilization rate as percentage (0-100)',
    example: 88.0,
  })
  utilizationRate: number;

  @ApiProperty({
    description: 'Cancellation rate as percentage (0-100)',
    example: 12.0,
  })
  cancellationRate: number;

  @ApiPropertyOptional({
    description: 'Peak usage hours',
    example: ['08:00-10:00', '14:00-16:00'],
  })
  peakHours?: string[];

  @ApiPropertyOptional({
    description: 'Most frequent days of the week',
    example: ['Monday', 'Wednesday', 'Friday'],
  })
  frequentDays?: string[];
}

/**
 * RF-31: Complete usage report response
 */
export class UsageReportResponseDto {
  @ApiProperty({
    description: 'Report metadata',
    type: ReportMetadataDto,
  })
  metadata: ReportMetadataDto;

  @ApiProperty({
    description: 'Report data',
    type: [UsageReportDataDto],
  })
  data: UsageReportDataDto[];

  @ApiPropertyOptional({
    description: 'Pagination information',
    type: PaginationMetaDto,
  })
  pagination?: PaginationMetaDto;

  @ApiProperty({
    description: 'Summary statistics',
    example: {
      totalResources: 15,
      totalReservations: 450,
      averageUtilization: 75.5,
      mostUsedResource: 'Aula Magna',
      leastUsedResource: 'Laboratorio 3',
    },
  })
  summary: {
    totalResources: number;
    totalReservations: number;
    averageUtilization: number;
    mostUsedResource: string;
    leastUsedResource: string;
  };
}

/**
 * RF-32: User reservations report data structure
 */
export class UserReportDataDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: '60f7b3b3b3b3b3b3b3b3b3b3',
      email: 'profesor@ufps.edu.co',
      firstName: 'Juan',
      lastName: 'Pérez',
      userType: 'TEACHER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
  };

  @ApiProperty({
    description: 'Total number of reservations made by user',
    example: 15,
  })
  totalReservations: number;

  @ApiProperty({
    description: 'Number of confirmed reservations',
    example: 12,
  })
  confirmedReservations: number;

  @ApiProperty({
    description: 'Number of cancelled reservations',
    example: 2,
  })
  cancelledReservations: number;

  @ApiProperty({
    description: 'Number of no-show reservations',
    example: 1,
  })
  noShowReservations: number;

  @ApiProperty({
    description: 'Utilization rate as percentage (0-100)',
    example: 80.0,
  })
  utilizationRate: number;

  @ApiProperty({
    description: 'Cancellation rate as percentage (0-100)',
    example: 13.3,
  })
  cancellationRate: number;

  @ApiProperty({
    description: 'Most frequently reserved resources',
    example: [
      { resourceName: 'Aula 101', count: 8 },
      { resourceName: 'Laboratorio 2', count: 4 },
    ],
  })
  frequentResources: Array<{
    resourceName: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'Total hours reserved',
    example: 45.5,
  })
  totalHours: number;

  @ApiPropertyOptional({
    description: 'Detailed reservation information (if requested)',
    example: [
      {
        id: '60f7b3b3b3b3b3b3b3b3b3b5',
        title: 'Clase de Programación',
        resourceName: 'Aula 101',
        startDate: '2024-01-15T08:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
        status: 'CONFIRMED',
      },
    ],
  })
  reservationDetails?: Array<{
    id: string;
    title: string;
    resourceName: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

/**
 * RF-32: Complete user report response
 */
export class UserReportResponseDto {
  @ApiProperty({
    description: 'Report metadata',
    type: ReportMetadataDto,
  })
  metadata: ReportMetadataDto;

  @ApiProperty({
    description: 'Report data',
    type: [UserReportDataDto],
  })
  data: UserReportDataDto[];

  @ApiPropertyOptional({
    description: 'Pagination information',
    type: PaginationMetaDto,
  })
  pagination?: PaginationMetaDto;

  @ApiProperty({
    description: 'Summary statistics',
    example: {
      totalUsers: 25,
      totalReservations: 375,
      averageReservationsPerUser: 15,
      topUser: 'profesor@ufps.edu.co',
      averageUtilization: 82.5,
    },
  })
  summary: {
    totalUsers: number;
    totalReservations: number;
    averageReservationsPerUser: number;
    topUser: string;
    averageUtilization: number;
  };
}

/**
 * RF-33: CSV Export response
 */
export class ExportResponseDto {
  @ApiProperty({
    description: 'Export status',
    example: 'SUCCESS',
  })
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';

  @ApiProperty({
    description: 'Download URL for the exported file',
    example: '/api/reports/exports/download/usage_report_2024_Q1.csv',
  })
  downloadUrl: string;

  @ApiProperty({
    description: 'Filename of the exported file',
    example: 'usage_report_2024_Q1.csv',
  })
  filename: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 15420,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Number of records exported',
    example: 150,
  })
  recordCount: number;

  @ApiProperty({
    description: 'Export generation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  generatedAt: string;

  @ApiPropertyOptional({
    description: 'Export expiration timestamp (for temporary downloads)',
    example: '2024-01-16T10:30:00.000Z',
  })
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Error message if export failed',
    example: 'Insufficient data for the specified filters',
  })
  errorMessage?: string;
}
