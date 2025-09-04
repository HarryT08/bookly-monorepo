import { Dialog, DialogTitle, DialogContent, Box, Typography, Paper } from '@mui/material';

export interface AuditLog {
	id: string;
	timestamp: string;
	userId: string;
	userEmail: string;
	userName: string;
	action: string;
	resource: string;
	resourceId: string;
	details: Record<string, any>;
	ipAddress: string;
	userAgent: string;
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	category: 'AUTH' | 'RESOURCE' | 'RESERVATION' | 'APPROVAL' | 'SYSTEM';
}

export interface AuditDetailsDialogProps {
	open: boolean;
	onClose: () => void;
	auditLog: AuditLog | null;
}

export function AuditDetailsDialog({ open, onClose, auditLog }: AuditDetailsDialogProps) {
	if (!auditLog) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>Detalles del Evento de Auditoría</DialogTitle>
			<DialogContent>
				<Box
					display="flex"
					flexWrap="wrap"
					gap={2}
					sx={{ mt: 1 }}
				>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 50%' }}
						minWidth={{ xs: '100%', md: '45%' }}
					>
						<Typography variant="subtitle2">ID del Evento</Typography>
						<Typography
							variant="body2"
							sx={{ mb: 2 }}
						>
							{auditLog.id}
						</Typography>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 50%' }}
						minWidth={{ xs: '100%', md: '45%' }}
					>
						<Typography variant="subtitle2">Timestamp</Typography>
						<Typography
							variant="body2"
							sx={{ mb: 2 }}
						>
							{new Date(auditLog.timestamp).toLocaleString('es-CO')}
						</Typography>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 50%' }}
						minWidth={{ xs: '100%', md: '45%' }}
					>
						<Typography variant="subtitle2">Usuario</Typography>
						<Typography
							variant="body2"
							sx={{ mb: 2 }}
						>
							{auditLog.userName} ({auditLog.userEmail})
						</Typography>
					</Box>
					<Box
						flex={{ xs: '1 1 100%', md: '1 1 50%' }}
						minWidth={{ xs: '100%', md: '45%' }}
					>
						<Typography variant="subtitle2">Dirección IP</Typography>
						<Typography
							variant="body2"
							fontFamily="monospace"
							sx={{ mb: 2 }}
						>
							{auditLog.ipAddress}
						</Typography>
					</Box>
					<Box
						flex={{ xs: '1 1 100%' }}
						minWidth="100%"
					>
						<Typography variant="subtitle2">User Agent</Typography>
						<Typography
							variant="body2"
							fontFamily="monospace"
							sx={{ mb: 2 }}
						>
							{auditLog.userAgent}
						</Typography>
					</Box>
					<Box
						flex={{ xs: '1 1 100%' }}
						minWidth="100%"
					>
						<Typography variant="subtitle2">Detalles del Evento</Typography>
						<Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
							<pre style={{ margin: 0, fontSize: '0.875rem' }}>
								{JSON.stringify(auditLog.details, null, 2)}
							</pre>
						</Paper>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
}

export default AuditDetailsDialog;
