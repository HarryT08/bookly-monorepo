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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { ApiResponseBookly, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Multer } from 'multer';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { STOCKPILE_URLS } from '@apps/stockpile-service/utils/maps/urls.map';

// Import Commands
import {
  CreateDocumentTemplateCommand,
  UpdateDocumentTemplateCommand,
  GenerateDocumentCommand,
  UploadDocumentTemplateCommand,
  DeleteDocumentTemplateCommand
} from '@apps/stockpile-service/application/commands/document-template.commands';

// Import Queries
import {
  GetDocumentTemplatesQuery,
  GetDocumentTemplateByIdQuery,
  GetDefaultDocumentTemplateQuery,
  GetGeneratedDocumentsByReservationQuery,
  GetGeneratedDocumentByIdQuery
} from '@apps/stockpile-service/application/queries/document-template.queries';

// Import DTOs
import {
  DocumentTemplateDto,
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  GeneratedDocumentDto,
  GenerateDocumentDto,
  DocumentEventType
} from '@libs/dto/stockpile/document-template.dto';

@ApiTags('Document Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.DOCUMENT_TEMPLATES)
export class DocumentTemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post(STOCKPILE_URLS.DOCUMENT_TEMPLATE_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create document template' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Document template created successfully', type: DocumentTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createDocumentTemplate(
    @Body() dto: CreateDocumentTemplateDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<DocumentTemplateDto>> {
    const command = new CreateDocumentTemplateCommand(
      dto.name,
      dto.eventType as DocumentEventType,
      dto.format,
      user.id,
      dto.categoryId,
      dto.description,
      dto.resourceType,
      dto.templatePath,
      dto.content,
      dto.variables,
      dto.isDefault,
      dto.canSendAsAttachment,
      dto.canSendAsLink
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Document template created successfully');
  }

  @Put(STOCKPILE_URLS.DOCUMENT_TEMPLATE_UPDATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update document template' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document template updated successfully', type: DocumentTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async updateDocumentTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentTemplateDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<DocumentTemplateDto>> {
    const command = new UpdateDocumentTemplateCommand(
      id,
      dto.name,
      dto.description,
      dto.content,
      dto.variables,
      dto.canSendAsAttachment,
      dto.canSendAsLink,
      dto.isActive
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Document template updated successfully');
  }

  @Delete(STOCKPILE_URLS.DOCUMENT_TEMPLATE_DELETE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete document template' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @SwaggerApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Document template deleted successfully' })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async deleteDocumentTemplate(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const command = new DeleteDocumentTemplateCommand(id, user.id);
    const result = await this.commandBus.execute(command);
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATES)
  @ApiOperation({ summary: 'Get document templates' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'documentType', required: false, description: 'Filter by document type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document templates retrieved successfully' })
  async getDocumentTemplates(
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('documentType') documentType?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ApiResponseBookly<DocumentTemplateDto[]>> {
    const query = new GetDocumentTemplatesQuery(
      resourceType,
      categoryId,
      documentType as DocumentEventType,
      isActive,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    const { templates, total } = result;
    return ResponseUtil.paginated(templates, total, page, limit, 'Document templates retrieved successfully') as SuccessResponseDto<DocumentTemplateDto[]>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document template by ID' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document template retrieved successfully', type: DocumentTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document template not found' })
  async getDocumentTemplateById(@Param('id') id: string): Promise<ApiResponseBookly<DocumentTemplateDto>> {
    const query = new GetDocumentTemplateByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Document template retrieved successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_DEFAULT_SEARCH)
  @ApiOperation({ summary: 'Get default document template for scope' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Event type' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Default document template retrieved successfully', type: DocumentTemplateDto })
  async getDefaultDocumentTemplate(
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('eventType') eventType?: string
  ): Promise<ApiResponseBookly<DocumentTemplateDto | null>> {
    const query = new GetDefaultDocumentTemplateQuery(eventType);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Default document template retrieved successfully');
  }

  @Post(STOCKPILE_URLS.DOCUMENT_TEMPLATE_UPLOAD)
  @Roles('COORDINATOR', 'ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document template file' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document template file uploaded successfully', type: DocumentTemplateDto })
  async uploadDocumentTemplate(
    @Param('id') id: string,
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<DocumentTemplateDto>> {
    const command = new UploadDocumentTemplateCommand(
      file.filename,
      file.buffer,
      id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Document template file uploaded successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_VARIABLES)
  @ApiOperation({ summary: 'Get document template variables' })
  @ApiParam({ name: 'id', description: 'Document template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document template variables retrieved successfully' })
  async getDocumentTemplateVariables(@Param('id') id: string): Promise<ApiResponseBookly<any>> {
    const query = new GetDocumentTemplateByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result.variables, 'Document template variables retrieved successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_TEMPLATE_AVAILABLE_VARIABLES)
  @ApiOperation({ summary: 'Get available document variables' })
  @ApiQuery({ name: 'eventType', required: true, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Available document variables retrieved successfully' })
  async getAvailableDocumentVariables(
    @Query('eventType') eventType: string,
    @Query('resourceType') resourceType?: string
  ): Promise<ApiResponseBookly<any>> {
    // This endpoint should return available variables for document generation
    // For now, return a simple structure - this should be implemented in a service
    return ResponseUtil.success({
      reservation: ['id', 'startDate', 'endDate', 'purpose'],
      user: ['name', 'email', 'program'],
      resource: ['name', 'location', 'capacity']
    }, 'Available document variables retrieved successfully');
  }

  @Post(STOCKPILE_URLS.DOCUMENT_GENERATE)
  @ApiOperation({ summary: 'Generate document from template' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Document generated successfully', type: GeneratedDocumentDto })
  async generateDocument(
    @Body() dto: GenerateDocumentDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<GeneratedDocumentDto>> {
    const command = new GenerateDocumentCommand(
      dto.templateId,
      dto.reservationId,
      dto.variables,
      user.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Document generated successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_GENERATED_BY_RESERVATION)
  @ApiOperation({ summary: 'Get generated documents by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Generated documents retrieved successfully', type: [GeneratedDocumentDto] })
  async getGeneratedDocumentsByReservation(
    @Param('reservationId') reservationId: string
  ): Promise<ApiResponseBookly<GeneratedDocumentDto[]>> {
    const query = new GetGeneratedDocumentsByReservationQuery(reservationId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Generated documents retrieved successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_GENERATED_BY_ID)
  @ApiOperation({ summary: 'Get generated document by ID' })
  @ApiParam({ name: 'id', description: 'Generated document ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Generated document retrieved successfully', type: GeneratedDocumentDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated document not found' })
  async getGeneratedDocumentById(@Param('id') id: string): Promise<ApiResponseBookly<GeneratedDocumentDto | null>> {
    const query = new GetGeneratedDocumentByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Generated document retrieved successfully');
  }

  @Get(STOCKPILE_URLS.DOCUMENT_DOWNLOAD)
  @ApiOperation({ summary: 'Download generated document' })
  @ApiParam({ name: 'id', description: 'Generated document ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Document downloaded successfully' })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated document not found' })
  async downloadGeneratedDocument(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const query = new GetGeneratedDocumentByIdQuery(id);
    const document = await this.queryBus.execute(query);
    
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
