import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ResourceImportRepository } from '@apps/resources-service/domain/repositories/resource-import.repository';
import { ResourceImportEntity, ImportError } from '@apps/resources-service/domain/entities/resource-import.entity';

import { 
  ResourceImportResponseDto,
  ImportRowDto,
  ImportSummaryDto,
  ImportPreviewDto 
} from '../dtos/resource-import.dto';
import { LoggingService } from '@libs/logging/logging.service';
import { ImportStatus } from '@apps/resources-service/utils/import-status.enum';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Multer } from 'multer';

/**
 * HITO 6 - RF-04: ResourceImport Application Service
 * Handles business logic for bulk resource imports
 */
@Injectable()
export class ResourceImportService {
  getImportTemplate(): any {
      throw new Error('Method not implemented.');
  }
  constructor(
    @Inject('ResourceImportRepository')
    private readonly resourceImportRepository: ResourceImportRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Validates and previews CSV file before import
   */
  async previewImport(
    file: Multer.File,
    userId: string
  ): Promise<ImportPreviewDto> {
    this.loggingService.log('Previewing CSV import', { 
      filename: file.originalname,
      size: file.size,
      userId 
    });

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV file');
    }

    const rows: ImportRowDto[] = [];
    const errors: string[] = [];
    let totalRows = 0;
    let validRows = 0;

    try {
      const csvData = await this.parseCsvFile(file.buffer);
      
      for (const [index, row] of csvData.entries()) {
        totalRows++;
        const rowNumber = index + 1;
        
        const validationResult = this.validateImportRow(row, rowNumber);
        
        if (validationResult.isValid) {
          validRows++;
          rows.push({
            rowNumber,
            name: row.name,
            type: row.type,
            capacity: parseInt(row.capacity) || 0,
            location: row.location || '',
            description: row.description || '',
            schedule: row.schedule || 'Monday-Saturday 06:00-22:00',
            availability: row.availability || 'AVAILABLE',
            isValid: true,
            errors: [],
          });
        } else {
          rows.push({
            rowNumber,
            name: row.name || '',
            type: row.type || '',
            capacity: parseInt(row.capacity) || 0,
            location: row.location || '',
            description: row.description || '',
            schedule: row.schedule || '',
            availability: row.availability || '',
            isValid: false,
            errors: validationResult.errors,
          });
          errors.push(...validationResult.errors.map(err => `Row ${rowNumber}: ${err}`));
        }
      }
    } catch (error) {
      this.loggingService.error('Error parsing CSV file', error);
      throw new BadRequestException('Invalid CSV file format');
    }

    const preview: ImportPreviewDto = {
      filename: file.originalname,
      totalRows,
      validRows,
      invalidRows: totalRows - validRows,
      errors,
      rows: rows.slice(0, 100), // Limit preview to first 100 rows
      canProceed: validRows > 0,
    };

    this.loggingService.log('CSV preview completed', {
      totalRows,
      validRows,
      invalidRows: totalRows - validRows,
      canProceed: preview.canProceed
    });

    return preview;
  }

  /**
   * Starts the import process
   */
  async startImport(
    file: Multer.File,
    userId: string
  ): Promise<ResourceImportResponseDto> {
    this.loggingService.log('Starting resource import', { 
      filename: file.originalname,
      userId 
    });

    // First validate the file
    const preview = await this.previewImport(file, userId);
    
    if (!preview.canProceed) {
      throw new BadRequestException('Cannot proceed with import due to validation errors');
    }

    // Create import record
    const importEntity = ResourceImportEntity.create(
      `import_${Date.now()}.csv`,
      file.originalname,
      preview.totalRows,
      userId,
    );

    const createdImport = await this.resourceImportRepository.create(importEntity);

    // Process import asynchronously
    this.processImportAsync(createdImport.id!, file.buffer, userId);

    return this.toResponseDto(createdImport);
  }

  /**
   * Gets import status and details
   */
  async getImportById(id: string): Promise<ResourceImportResponseDto> {
    const importRecord = await this.resourceImportRepository.findById(id);
    if (!importRecord) {
      throw new NotFoundException(`Import with ID '${id}' not found`);
    }

    return this.toResponseDto(importRecord);
  }

  /**
   * Gets imports by user
   */
  async getImportsByUser(userId: string): Promise<ResourceImportResponseDto[]> {
    const imports = await this.resourceImportRepository.findByUser(userId);
    return imports.map(this.toResponseDto);
  }

  /**
   * Gets imports with pagination
   */
  async getImports(
    page: number = 1,
    limit: number = 10,
    filters?: {
      userId?: string;
      status?: ImportStatus;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ imports: ResourceImportResponseDto[]; total: number; page: number; limit: number }> {
    const { imports, total } = await this.resourceImportRepository.findWithPagination(
      page,
      limit,
      filters,
    );

    return {
      imports: imports.map(this.toResponseDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Gets import statistics
   */
  async getImportStatistics(userId?: string): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }> {
    return await this.resourceImportRepository.getStatistics(userId);
  }

  /**
   * Cleans up old import records (older than specified days)
   */
  async cleanupOldImports(daysOld: number = 30): Promise<{ deletedCount: number }> {
    this.loggingService.log('Starting cleanup of old imports', { daysOld });

    try {
      const deletedCount = await this.resourceImportRepository.deleteOldImports(daysOld);
      
      this.loggingService.log('Old imports cleanup completed', {
        daysOld,
        deletedCount
      });

      return { deletedCount };
    } catch (error) {
      this.loggingService.error('Error during old imports cleanup', error);
      throw new Error(`Failed to cleanup old imports: ${error.message}`);
    }
  }

  /**
   * Processes import asynchronously
   */
  async processImportAsync(importId: string, fileBuffer: Buffer, userId: string): Promise<void> {
    try {
      this.loggingService.log('Processing import asynchronously', { importId });

      const importRecord = await this.resourceImportRepository.findById(importId);
      if (!importRecord) {
        throw new Error(`Import record ${importId} not found`);
      }

      // Update status to processing
      const processingEntity = importRecord.updateProgress(0, 0, []);
      await this.resourceImportRepository.update(importId, processingEntity);

      const csvData = await this.parseCsvFile(fileBuffer);
      let successfulRows = 0;
      let failedRows = 0;
      const errors: any[] = [];

      for (const [index, row] of csvData.entries()) {
        try {
          const validationResult = this.validateImportRow(row, index + 1);
          
          if (validationResult.isValid) {
            // TODO: Create actual resource here
            // await this.resourceService.createResource(...)
            successfulRows++;
          } else {
            failedRows++;
            errors.push({
              row: index + 1,
              errors: validationResult.errors,
            });
          }
        } catch (error) {
          failedRows++;
          errors.push({
            row: index + 1,
            errors: [`Unexpected error: ${error.message}`],
          });
        }
      }

      // Complete the import
      const completedEntity = importRecord.complete(
        successfulRows,
        failedRows,
        errors,
        {
          totalProcessed: successfulRows + failedRows,
          successRate: ((successfulRows / (successfulRows + failedRows)) * 100).toFixed(2),
          processingTime: new Date().getTime() - importRecord.importedAt!.getTime(),
        },
        importRecord.summary,
      );

      await this.resourceImportRepository.update(importId, completedEntity);

      this.loggingService.log('Import completed successfully', {
        importId,
        successfulRows,
        failedRows,
      });

    } catch (error) {
      this.loggingService.error('Import processing failed', error, importId);

      // Mark import as failed
      const importRecord = await this.resourceImportRepository.findById(importId);
      if (importRecord) {
        const failedEntity = importRecord.fail([
          {
              row: 0,
              errors: [`Processing failed: ${error.message}`],
          } as unknown as ImportError,
        ]);
        
        await this.resourceImportRepository.update(importId, failedEntity);
      }
    }
  }

  /**
   * Parses CSV file buffer
   */
  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Validates a single import row
   */
  private validateImportRow(row: any, rowNumber: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!row.name || row.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!row.type || row.type.trim() === '') {
      errors.push('Type is required');
    }

    if (!row.capacity || isNaN(parseInt(row.capacity))) {
      errors.push('Capacity must be a valid number');
    } else if (parseInt(row.capacity) <= 0) {
      errors.push('Capacity must be greater than 0');
    }

    // Optional field validations
    if (row.availability && !['AVAILABLE', 'MAINTENANCE', 'RESERVED', 'OUT_OF_SERVICE'].includes(row.availability)) {
      errors.push('Availability must be one of: AVAILABLE, MAINTENANCE, RESERVED, OUT_OF_SERVICE');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts domain entity to response DTO
   */
  private toResponseDto(importRecord: ResourceImportEntity): ResourceImportResponseDto {
    return {
      id: importRecord.id!,
      filename: importRecord.filename!,
      originalFilename: importRecord.originalFilename!,
      totalRows: importRecord.totalRows!,
      successfulRows: importRecord.successfulRows!,
      failedRows: importRecord.failedRows!,
      status: importRecord.status!,
      errors: importRecord.errors || [],
      summary: importRecord.summary || {
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [],
        processingTime: 0,
      } as unknown as ImportSummaryDto,
      importedBy: importRecord.importedBy!,
      importedAt: importRecord.importedAt!,
      completedAt: importRecord.completedAt,
    };
  }
}
