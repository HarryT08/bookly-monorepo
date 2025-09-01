'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Button,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Alert,
	Stack,
	Pagination,
	IconButton,
	Tooltip
} from '@mui/material';
import {
	Download as DownloadIcon,
	Visibility as ViewIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	PictureAsPdf as PdfIcon,
	Description as DocIcon
} from '@mui/icons-material';

import { PageTitle } from '@components/atoms';
import { useDocumentTemplate, useDocumentGeneration } from '@hooks/useStockpile';
import {
	DocumentTemplate,
	GeneratedDocument,
	DocumentEventType,
	DocumentFormat,
	CreateDocumentTemplateRequest,
	GenerateDocumentRequest,
	DocumentFilter,
	DocumentStats
} from '@services/stockpile';

const formatLabels = {
	[DocumentFormat.PDF]: 'PDF',
	[DocumentFormat.DOCX]: 'DOCX',
	[DocumentFormat.HTML]: 'HTML'
};

const eventTypeLabels = {
	[DocumentEventType.RESERVATION_APPROVED]: 'Reservation Approved',
	[DocumentEventType.RESERVATION_REJECTED]: 'Reservation Rejected',
	[DocumentEventType.RESERVATION_CANCELLED]: 'Reservation Cancelled',
	[DocumentEventType.RESERVATION_MODIFIED]: 'Reservation Modified'
};

export default function DocumentsPage() {
	// State management
	const [activeTab, setActiveTab] = useState<'templates' | 'documents'>('documents');
	const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
	const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
	const [stats, setStats] = useState<DocumentStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Dialog states
	const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
	const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);

	// Form states
	const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
	const [templateForm, setTemplateForm] = useState<CreateDocumentTemplateRequest>({
		name: '',
		eventType: DocumentEventType.RESERVATION_APPROVED,
		format: DocumentFormat.PDF,
		content: ''
	});
	const [generateForm, setGenerateForm] = useState<GenerateDocumentRequest>({
		templateId: '',
		reservationId: '',
		variables: {}
	});
	const [previewContent, setPreviewContent] = useState<{ content: string; fileName: string } | null>(null);
	const [filter, setFilter] = useState<DocumentFilter>({
		page: 1,
		limit: 10
	});

	// Hooks
	const {
		loading: templateLoading,
		error: templateError,
		createTemplate,
		updateTemplate,
		getTemplates,
		deleteTemplate,
		previewTemplate
	} = useDocumentTemplate();

	const {
		loading: docLoading,
		error: docError,
		generateDocument,
		getDocuments,
		downloadDocument,
		deleteDocument,
		getDocumentStats
	} = useDocumentGeneration();

	// Load data
	const loadTemplates = useCallback(async () => {
		setLoading(true);
		const result = await getTemplates({ page, limit: 10 });
		if (result) {
			setTemplates(result.data);
			setTotalPages(result.totalPages);
		}
		setLoading(false);
	}, [getTemplates, page]);

	const loadDocuments = useCallback(async () => {
		setLoading(true);
		const result = await getDocuments({ ...filter, page });
		if (result) {
			setDocuments(result.data);
			setTotalPages(result.totalPages);
		}
		setLoading(false);
	}, [getDocuments, filter, page]);

	const loadStats = useCallback(async () => {
		const result = await getDocumentStats();
		if (result) {
			setStats(result);
		}
	}, [getDocumentStats]);

	useEffect(() => {
		if (activeTab === 'templates') {
			loadTemplates();
		} else {
			loadDocuments();
		}
		loadStats();
	}, [activeTab, loadTemplates, loadDocuments, loadStats]);

	// Event handlers
	const handleCreateTemplate = async () => {
		const result = await createTemplate(templateForm);
		if (result) {
			setTemplateDialogOpen(false);
			resetTemplateForm();
			if (activeTab === 'templates') {
				loadTemplates();
			}
		}
	};

	const handleUpdateTemplate = async () => {
		if (!selectedTemplate) return;

		const result = await updateTemplate(selectedTemplate.id, templateForm);
		if (result) {
			setTemplateDialogOpen(false);
			resetTemplateForm();
			if (activeTab === 'templates') {
				loadTemplates();
			}
		}
	};

	const handleDeleteTemplate = async (id: string) => {
		const success = await deleteTemplate(id);
		if (success && activeTab === 'templates') {
			loadTemplates();
		}
	};

	const handleGenerateDocument = async () => {
		const result = await generateDocument(generateForm);
		if (result) {
			setGenerateDialogOpen(false);
			resetGenerateForm();
			if (activeTab === 'documents') {
				loadDocuments();
			}
			loadStats();
		}
	};

	const handlePreviewTemplate = async (template: DocumentTemplate) => {
		const result = await previewTemplate(template.id, {});
		if (result) {
			setPreviewContent(result);
			setPreviewDialogOpen(true);
		}
	};

	const handleDownloadDocument = async (doc: GeneratedDocument) => {
		await downloadDocument(doc.id, doc.fileName);
	};

	const handleDeleteDocument = async (id: string) => {
		const success = await deleteDocument(id);
		if (success && activeTab === 'documents') {
			loadDocuments();
			loadStats();
		}
	};

	const resetTemplateForm = () => {
		setTemplateForm({
			name: '',
			eventType: DocumentEventType.RESERVATION_APPROVED,
			format: DocumentFormat.PDF,
			content: ''
		});
		setSelectedTemplate(null);
	};

	const resetGenerateForm = () => {
		setGenerateForm({
			templateId: '',
			reservationId: '',
			variables: {}
		});
	};

	const openTemplateDialog = (template?: DocumentTemplate) => {
		if (template) {
			setSelectedTemplate(template);
			setTemplateForm({
				name: template.name,
				eventType: template.eventType,
				format: template.format,
				description: template.description,
				content: template.content,
				variables: template.variables
			});
		} else {
			resetTemplateForm();
		}
		setTemplateDialogOpen(true);
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const formatFileSize = (bytes?: number): string => {
		if (!bytes) return 'Unknown';
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
	};

	return (
		<Box sx={{ p: 3 }}>
			<Stack spacing={3}>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<PageTitle title="Document Management" />
					<Stack
						direction="row"
						spacing={2}
					>
						<Button
							variant={activeTab === 'documents' ? 'contained' : 'outlined'}
							onClick={() => setActiveTab('documents')}
						>
							Generated Documents
						</Button>
						<Button
							variant={activeTab === 'templates' ? 'contained' : 'outlined'}
							onClick={() => setActiveTab('templates')}
						>
							Templates
						</Button>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={activeTab === 'templates' ? loadTemplates : loadDocuments}
						>
							Refresh
						</Button>
					</Stack>
				</Box>

				{/* Stats Cards */}
				{stats && (
					<Grid
						container
						spacing={2}
					>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Generated Today
									</Typography>
									<Typography variant="h4">{stats.generatedToday}</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Total Generated
									</Typography>
									<Typography variant="h4">{stats.totalGenerated}</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										PDF Documents
									</Typography>
									<Typography variant="h4">{stats.byFormat.PDF || 0}</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid
							item
							xs={12}
							sm={6}
							md={3}
						>
							<Card>
								<CardContent>
									<Typography
										color="textSecondary"
										gutterBottom
									>
										Approvals Generated
									</Typography>
									<Typography variant="h4">{stats.byEventType.RESERVATION_APPROVED || 0}</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				)}

				{/* Error Alerts */}
				{templateError && <Alert severity="error">{templateError}</Alert>}
				{docError && <Alert severity="error">{docError}</Alert>}

				{/* Templates Table */}
				{activeTab === 'templates' && (
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant="h6">Document Templates</Typography>
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={() => openTemplateDialog()}
								>
									Create Template
								</Button>
							</Box>

							<TableContainer
								component={Paper}
								elevation={0}
							>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Name</TableCell>
											<TableCell>Event Type</TableCell>
											<TableCell>Format</TableCell>
											<TableCell>Scope</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Created</TableCell>
											<TableCell>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell
													colSpan={7}
													align="center"
												>
													Loading templates...
												</TableCell>
											</TableRow>
										) : templates.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={7}
													align="center"
												>
													No templates found
												</TableCell>
											</TableRow>
										) : (
											templates.map((template) => (
												<TableRow key={template.id}>
													<TableCell>
														<Box>
															<Typography
																variant="body2"
																fontWeight="bold"
															>
																{template.name}
															</Typography>
															<Typography
																variant="caption"
																color="textSecondary"
															>
																{template.description}
															</Typography>
														</Box>
													</TableCell>
													<TableCell>
														<Chip
															label={eventTypeLabels[template.eventType]}
															size="small"
															color="primary"
														/>
													</TableCell>
													<TableCell>
														<Chip
															label={formatLabels[template.format]}
															size="small"
															variant="outlined"
														/>
													</TableCell>
													<TableCell>
														<Typography variant="caption">
															{template.resourceType || 'All Resources'}
														</Typography>
													</TableCell>
													<TableCell>
														<Chip
															label={template.isActive ? 'Active' : 'Inactive'}
															color={template.isActive ? 'success' : 'default'}
															size="small"
														/>
													</TableCell>
													<TableCell>
														<Typography variant="caption">
															{formatDate(template.createdAt)}
														</Typography>
													</TableCell>
													<TableCell>
														<Stack
															direction="row"
															spacing={1}
														>
															<Tooltip title="Preview">
																<IconButton
																	size="small"
																	onClick={() => handlePreviewTemplate(template)}
																>
																	<ViewIcon />
																</IconButton>
															</Tooltip>
															<Tooltip title="Edit">
																<IconButton
																	size="small"
																	onClick={() => openTemplateDialog(template)}
																>
																	<DocIcon />
																</IconButton>
															</Tooltip>
															<Tooltip title="Delete">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => handleDeleteTemplate(template.id)}
																>
																	<DeleteIcon />
																</IconButton>
															</Tooltip>
														</Stack>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				)}

				{/* Documents Table */}
				{activeTab === 'documents' && (
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant="h6">Generated Documents</Typography>
								<Stack
									direction="row"
									spacing={2}
								>
									<Button
										variant="outlined"
										startIcon={<FilterIcon />}
										onClick={() => setFilterDialogOpen(true)}
									>
										Filter
									</Button>
									<Button
										variant="contained"
										startIcon={<AddIcon />}
										onClick={() => setGenerateDialogOpen(true)}
									>
										Generate Document
									</Button>
								</Stack>
							</Box>

							<TableContainer
								component={Paper}
								elevation={0}
							>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>File Name</TableCell>
											<TableCell>Template</TableCell>
											<TableCell>Reservation ID</TableCell>
											<TableCell>File Size</TableCell>
											<TableCell>Generated By</TableCell>
											<TableCell>Created</TableCell>
											<TableCell>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell
													colSpan={7}
													align="center"
												>
													Loading documents...
												</TableCell>
											</TableRow>
										) : documents.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={7}
													align="center"
												>
													No documents found
												</TableCell>
											</TableRow>
										) : (
											documents.map((doc) => (
												<TableRow key={doc.id}>
													<TableCell>
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
															<PdfIcon color="error" />
															<Typography variant="body2">{doc.fileName}</Typography>
														</Box>
													</TableCell>
													<TableCell>{doc.templateId}</TableCell>
													<TableCell>
														<Typography
															variant="caption"
															fontFamily="monospace"
														>
															{doc.reservationId}
														</Typography>
													</TableCell>
													<TableCell>{formatFileSize(doc.fileSize)}</TableCell>
													<TableCell>{doc.generatedBy}</TableCell>
													<TableCell>
														<Typography variant="caption">
															{formatDate(doc.createdAt)}
														</Typography>
													</TableCell>
													<TableCell>
														<Stack
															direction="row"
															spacing={1}
														>
															<Tooltip title="Download">
																<IconButton
																	size="small"
																	color="primary"
																	onClick={() => handleDownloadDocument(doc)}
																>
																	<DownloadIcon />
																</IconButton>
															</Tooltip>
															<Tooltip title="Delete">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => handleDeleteDocument(doc.id)}
																>
																	<DeleteIcon />
																</IconButton>
															</Tooltip>
														</Stack>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={(_, newPage) => setPage(newPage)}
							color="primary"
						/>
					</Box>
				)}
			</Stack>

			{/* Template Dialog */}
			<Dialog
				open={templateDialogOpen}
				onClose={() => setTemplateDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
				<DialogContent>
					<Stack
						spacing={2}
						sx={{ mt: 1 }}
					>
						<TextField
							fullWidth
							label="Template Name"
							value={templateForm.name}
							onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
						/>

						<TextField
							fullWidth
							label="Description"
							multiline
							rows={2}
							value={templateForm.description || ''}
							onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
						/>

						<Grid
							container
							spacing={2}
						>
							<Grid
								item
								xs={6}
							>
								<FormControl fullWidth>
									<InputLabel>Event Type</InputLabel>
									<Select
										value={templateForm.eventType}
										onChange={(e) =>
											setTemplateForm({
												...templateForm,
												eventType: e.target.value as DocumentEventType
											})
										}
									>
										{Object.values(DocumentEventType).map((type) => (
											<MenuItem
												key={type}
												value={type}
											>
												{eventTypeLabels[type]}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid
								item
								xs={6}
							>
								<FormControl fullWidth>
									<InputLabel>Format</InputLabel>
									<Select
										value={templateForm.format}
										onChange={(e) =>
											setTemplateForm({
												...templateForm,
												format: e.target.value as DocumentFormat
											})
										}
									>
										{Object.values(DocumentFormat).map((format) => (
											<MenuItem
												key={format}
												value={format}
											>
												{formatLabels[format]}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>

						<TextField
							fullWidth
							label="Template Content"
							multiline
							rows={10}
							value={templateForm.content || ''}
							onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
							helperText="Use [variableName] for dynamic content"
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
						variant="contained"
						disabled={!templateForm.name || !templateForm.content}
					>
						{selectedTemplate ? 'Update' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Generate Document Dialog */}
			<Dialog
				open={generateDialogOpen}
				onClose={() => setGenerateDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Generate Document</DialogTitle>
				<DialogContent>
					<Stack
						spacing={2}
						sx={{ mt: 1 }}
					>
						<FormControl fullWidth>
							<InputLabel>Template</InputLabel>
							<Select
								value={generateForm.templateId}
								onChange={(e) =>
									setGenerateForm({
										...generateForm,
										templateId: e.target.value
									})
								}
							>
								{templates
									.filter((t) => t.isActive)
									.map((template) => (
										<MenuItem
											key={template.id}
											value={template.id}
										>
											{template.name} ({formatLabels[template.format]})
										</MenuItem>
									))}
							</Select>
						</FormControl>

						<TextField
							fullWidth
							label="Reservation ID"
							value={generateForm.reservationId}
							onChange={(e) =>
								setGenerateForm({
									...generateForm,
									reservationId: e.target.value
								})
							}
						/>

						<TextField
							fullWidth
							label="Variables (JSON)"
							multiline
							rows={4}
							value={JSON.stringify(generateForm.variables, null, 2)}
							onChange={(e) => {
								try {
									const variables = JSON.parse(e.target.value);
									setGenerateForm({ ...generateForm, variables });
								} catch {
									// Invalid JSON, ignore
								}
							}}
							helperText="Provide variables as JSON object"
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleGenerateDocument}
						variant="contained"
						disabled={!generateForm.templateId || !generateForm.reservationId}
					>
						Generate
					</Button>
				</DialogActions>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog
				open={previewDialogOpen}
				onClose={() => setPreviewDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Template Preview</DialogTitle>
				<DialogContent>
					{previewContent && (
						<Box>
							<Typography
								variant="h6"
								gutterBottom
							>
								{previewContent.fileName}
							</Typography>
							<Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
								<Typography
									variant="body2"
									component="pre"
									sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
								>
									{previewContent.content}
								</Typography>
							</Paper>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
