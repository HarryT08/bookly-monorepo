import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Multer } from 'multer';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { DocumentTemplateService } from '../../application/services/document-template.service';
import {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  GenerateDocumentDto,
  DocumentTemplateDto,
  GeneratedDocumentDto,
  DocumentEventType
} from '@dto/stockpile/document-template.dto';
import { STOCKPILE_URLS } from '../../utils/maps/urls.map';

@ApiTags('Document Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.DOCUMENT_TEMPLATES)
export class DocumentTemplateController {
  constructor(private readonly documentTemplateService: DocumentTemplateService) {}

  @Post(STOCKPILE_URLS.DOCUMENT_TEMPLATE_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create document template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Document template created successfully', type: DocumentTemplateDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createDocumentTemplate(
    @Body() dto: CreateDocumentTemplateDto,
    @CurrentUser() user: any
  ): Promise<DocumentTemplateDto> {
    dto.createdBy = user.id;
    return await this.documentTemplateService.createDocumentTemplate(dto);
  }

  @Put(STOCKPILE_URLS.DOCUMENT_TEMPLATE_UPDATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update document template' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document template updated successfully', type: DocumentTemplateDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async updateDocumentTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentTemplateDto
  ): Promise<DocumentTemplateDto> {
    return await this.documentTemplateService.updateDocumentTemplate(id, dto);
  }

  @Delete(STOCKPILE_URLS.DOCUMENT_TEMPLATE_DELETE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete document template' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Document template deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async deleteDocumentTemplate(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    return await this.documentTemplateService.deleteDocumentTemplate(id, user.id);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATES)
  @ApiOperation({ summary: 'Get document templates' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'eventType', required: false, enum: DocumentEventType, description: 'Filter by event type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document templates retrieved successfully' })
  async getDocumentTemplates(
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('eventType') eventType?: DocumentEventType,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    return await this.documentTemplateService.getDocumentTemplates(
      resourceType,
      categoryId,
      eventType,
      isActive,
      page,
      limit
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document template by ID' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document template retrieved successfully', type: DocumentTemplateDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async getDocumentTemplateById(@Param('id') id: string): Promise<DocumentTemplateDto | null> {
    return await this.documentTemplateService.getDocumentTemplateById(id);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_DEFAULT_SEARCH)
  @ApiOperation({ summary: 'Get default document template for scope' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @ApiQuery({ name: 'eventType', required: false, enum: DocumentEventType, description: 'Event type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Default document template retrieved successfully', type: DocumentTemplateDto })
  async getDefaultDocumentTemplate(
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('eventType') eventType?: DocumentEventType
  ): Promise<DocumentTemplateDto | null> {
    return await this.documentTemplateService.getDefaultDocumentTemplate(resourceType, categoryId, eventType);
  }

  @Post(STOCKPILE_URLS.DOCUMENT_TEMPLATE_UPLOAD)
  @Roles('COORDINATOR', 'ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document template file' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document template file uploaded successfully', type: DocumentTemplateDto })
  async uploadDocumentTemplate(
    @Param('id') id: string,
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: any
  ): Promise<DocumentTemplateDto> {
    return await this.documentTemplateService.uploadDocumentTemplate(id, file, user.id);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_VARIABLES)
  @ApiOperation({ summary: 'Get document template variables' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document template variables retrieved successfully' })
  async getDocumentTemplateVariables(@Param('id') id: string): Promise<any> {
    return await this.documentTemplateService.getDocumentTemplateVariables(id);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_AVAILABLE_VARIABLES)
  @ApiOperation({ summary: 'Get available document variables' })
  @ApiQuery({ name: 'eventType', required: true, enum: DocumentEventType, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available document variables retrieved successfully' })
  async getAvailableDocumentVariables(
    @Query('eventType') eventType: DocumentEventType,
    @Query('resourceType') resourceType?: string
  ): Promise<any> {
    return await this.documentTemplateService.getAvailableDocumentVariables(eventType, resourceType);
  }

  @Post(STOCKPILE_URLS.DOCUMENT_GENERATE)
  @ApiOperation({ summary: 'Generate document from template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Document generated successfully', type: GeneratedDocumentDto })
  async generateDocument(
    @Body() dto: GenerateDocumentDto,
    @CurrentUser() user: any
  ): Promise<GeneratedDocumentDto> {
    dto.generatedBy = user.id;
    return await this.documentTemplateService.generateDocument(dto);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_GENERATED_BY_RESERVATION)
  @ApiOperation({ summary: 'Get generated documents by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Generated documents retrieved successfully', type: [GeneratedDocumentDto] })
  async getGeneratedDocumentsByReservation(
    @Param('reservationId') reservationId: string
  ): Promise<GeneratedDocumentDto[]> {
    return await this.documentTemplateService.getGeneratedDocumentsByReservation(reservationId);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_GENERATED_BY_ID)
  @ApiOperation({ summary: 'Get generated document by ID' })
  @ApiParam({ name: 'id', description: 'Generated document ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Generated document retrieved successfully', type: GeneratedDocumentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated document not found' })
  async getGeneratedDocumentById(@Param('id') id: string): Promise<GeneratedDocumentDto | null> {
    return await this.documentTemplateService.getGeneratedDocumentById(id);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_DOWNLOAD)
  @ApiOperation({ summary: 'Download generated document' })
  @ApiParam({ name: 'id', description: 'Generated document ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Document downloaded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated document not found' })
  async downloadGeneratedDocument(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const document = await this.documentTemplateService.getGeneratedDocumentById(id);
    
    if (!document || !document.filePath) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Document not found' });
      return;
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    // In a real implementation, you would stream the file from storage
    // For now, we'll just return the file path information
    res.json({
      message: 'Document download would start here',
      filePath: document.filePath,
      fileName: document.fileName
    });
  }
}
