'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import {
	PersonAdd as PersonAddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Block as BlockIcon,
	CheckCircle as CheckCircleIcon,
	People as PeopleIcon,
	PersonOutline as PersonOutlineIcon,
	Security as SecurityIcon
} from '@mui/icons-material';
import { StatusChip, Chip } from '../../../components/atoms';
import { ActionMenu } from '../../../components/molecules';
import { StatCardProps } from '../../../components/molecules/StatCard/StatCard';
import { DataTableColumn, UserRoleDialog } from '@/components/organisms';
import { DataTablePageTemplate } from '@/components/templates';
import { PageHeaderProps } from '@components/molecules/page-form-header';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: string[];
	status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
	lastLoginAt?: string;
	createdAt: string;
}

interface UsersPageData {
	users: User[];
	stats: {
		totalUsers: number;
		activeUsers: number;
		blockedUsers: number;
	};
	loading: boolean;
	error: string | null;
}

export default function UsersPage() {
	const [data, setData] = useState<UsersPageData>({
		users: [],
		stats: { totalUsers: 0, activeUsers: 0, blockedUsers: 0 },
		loading: true,
		error: null
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState({
		role: '',
		status: ''
	});
	const [roleDialogOpen, setRoleDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	// Mock data fetch
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setData((prev) => ({ ...prev, loading: true, error: null }));

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const mockUsers: User[] = [
					{
						id: '1',
						email: 'admin@ufps.edu.co',
						firstName: 'Administrador',
						lastName: 'Sistema',
						roles: ['ADMIN'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-15T10:30:00Z',
						createdAt: '2023-01-01T00:00:00Z'
					},
					{
						id: '2',
						email: 'estudiante@ufps.edu.co',
						firstName: 'Juan',
						lastName: 'Pérez',
						roles: ['STUDENT'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-14T15:20:00Z',
						createdAt: '2023-02-15T00:00:00Z'
					},
					{
						id: '3',
						email: 'docente@ufps.edu.co',
						firstName: 'María',
						lastName: 'García',
						roles: ['TEACHER'],
						status: 'ACTIVE',
						lastLoginAt: '2024-01-13T09:15:00Z',
						createdAt: '2023-03-10T00:00:00Z'
					},
					{
						id: '4',
						email: 'personal@ufps.edu.co',
						firstName: 'Carlos',
						lastName: 'López',
						roles: ['STAFF'],
						status: 'BLOCKED',
						lastLoginAt: '2024-01-10T14:45:00Z',
						createdAt: '2023-04-20T00:00:00Z'
					},
					{
						id: '5',
						email: 'coordinador@ufps.edu.co',
						firstName: 'Ana',
						lastName: 'Martínez',
						roles: ['TEACHER', 'ADMIN'],
						status: 'ACTIVE',
						createdAt: '2023-05-15T00:00:00Z'
					}
				];

				const stats = {
					totalUsers: mockUsers.length,
					activeUsers: mockUsers.filter((u) => u.status === 'ACTIVE').length,
					blockedUsers: mockUsers.filter((u) => u.status === 'BLOCKED').length
				};

				setData({
					users: mockUsers,
					stats,
					loading: false,
					error: null
				});
			} catch (err) {
				setData((prev) => ({
					...prev,
					loading: false,
					error: 'Error al cargar usuarios'
				}));
				console.error('Error loading users:', err);
			}
		};

		fetchUsers();
	}, []);

	// Filter users based on search and filters
	const filteredUsers = data.users.filter((user) => {
		const matchesSearch =
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesFilters =
			(!filters.role || user.roles.includes(filters.role)) && (!filters.status || user.status === filters.status);

		return matchesSearch && matchesFilters;
	});

	const handleUserAction = (action: string, user: User) => {
		switch (action) {
			case 'edit':
				console.log('Edit user:', user);
				break;
			case 'manage-roles':
				setSelectedUser(user);
				setRoleDialogOpen(true);
				break;
			case 'toggle-block':
				const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
				setData((prev) => ({
					...prev,
					users: prev.users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
					stats: {
						...prev.stats,
						activeUsers: newStatus === 'ACTIVE' ? prev.stats.activeUsers + 1 : prev.stats.activeUsers - 1,
						blockedUsers:
							newStatus === 'BLOCKED' ? prev.stats.blockedUsers + 1 : prev.stats.blockedUsers - 1
					}
				}));
				break;
			case 'delete':
				setData((prev) => ({
					...prev,
					users: prev.users.filter((u) => u.id !== user.id),
					stats: {
						totalUsers: prev.stats.totalUsers - 1,
						activeUsers: user.status === 'ACTIVE' ? prev.stats.activeUsers - 1 : prev.stats.activeUsers,
						blockedUsers: user.status === 'BLOCKED' ? prev.stats.blockedUsers - 1 : prev.stats.blockedUsers
					}
				}));
				break;
			default:
				break;
		}
	};

	const handleSaveRoles = (userId: string, roles: string[]) => {
		setData((prev) => ({
			...prev,
			users: prev.users.map((u) => (u.id === userId ? { ...u, roles } : u))
		}));
		setRoleDialogOpen(false);
		setSelectedUser(null);
	};

	// Page header configuration
	const pageHeaderProps: PageHeaderProps = {
		title: 'Gestión de Usuarios',
		actions: [
			{
				label: 'Agregar Usuario',
				variant: 'contained',
				startIcon: <PersonAddIcon />,
				onClick: () => console.log('Navigate to create user')
			}
		]
	};

	// Stats configuration
	const statsData: StatCardProps[] = [
		{
			title: 'Total Usuarios',
			value: data.stats.totalUsers.toString(),
			icon: <PeopleIcon />,
			iconColor: 'primary'
		},
		{
			title: 'Usuarios Activos',
			value: data.stats.activeUsers.toString(),
			icon: <CheckCircleIcon />,
			iconColor: 'success'
		},
		{
			title: 'Usuarios Bloqueados',
			value: data.stats.blockedUsers.toString(),
			icon: <SecurityIcon />,
			iconColor: 'error'
		}
	];

	// Filter configuration
	const filterOptions = [
		{
			key: 'role',
			label: 'Rol',
			options: [
				{ value: '', label: 'Todos los roles' },
				{ value: 'ADMIN', label: 'Administrador' },
				{ value: 'TEACHER', label: 'Docente' },
				{ value: 'STUDENT', label: 'Estudiante' },
				{ value: 'STAFF', label: 'Personal' }
			]
		},
		{
			key: 'status',
			label: 'Estado',
			options: [
				{ value: '', label: 'Todos los estados' },
				{ value: 'ACTIVE', label: 'Activo' },
				{ value: 'INACTIVE', label: 'Inactivo' },
				{ value: 'BLOCKED', label: 'Bloqueado' }
			]
		}
	];

	// Helper functions
	const getRoleChips = (roles: string[]) => {
		const roleColors = {
			ADMIN: 'error' as const,
			TEACHER: 'primary' as const,
			STUDENT: 'secondary' as const,
			STAFF: 'info' as const
		};

		return (
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
				{roles.map((role) => (
					<Chip
						key={role}
						size="small"
						color={roleColors[role as keyof typeof roleColors] || 'default'}
						label={role}
					/>
				))}
			</Box>
		);
	};

	const formatLastLogin = (lastLoginAt?: string) => {
		if (!lastLoginAt) return 'Nunca';
		return new Date(lastLoginAt).toLocaleDateString('es-CO', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Table columns configuration
	const columns: DataTableColumn[] = [
		{
			id: 'user',
			label: 'Usuario',
			align: 'left',
			render: (_, row: User) => (
				<Box
					display="flex"
					alignItems="center"
				>
					<Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
						{row.firstName[0]}
						{row.lastName[0]}
					</Avatar>
					<Box>
						<Typography
							variant="body2"
							fontWeight="bold"
						>
							{row.firstName} {row.lastName}
						</Typography>
					</Box>
				</Box>
			)
		},
		{
			id: 'email',
			label: 'Email',
			align: 'left'
		},
		{
			id: 'roles',
			label: 'Roles',
			align: 'left',
			render: (_, row: User) => getRoleChips(row.roles)
		},
		{
			id: 'status',
			label: 'Estado',
			align: 'center',
			render: (_, row: User) => {
				const statusConfig = {
					ACTIVE: { color: 'success' as const, label: 'Activo', icon: <CheckCircleIcon /> },
					INACTIVE: { color: 'default' as const, label: 'Inactivo', icon: <PersonOutlineIcon /> },
					BLOCKED: { color: 'error' as const, label: 'Bloqueado', icon: <BlockIcon /> }
				};
				const config = statusConfig[row.status];
				return (
					<StatusChip
						status={config.color}
						label={config.label}
						icon={config.icon}
					/>
				);
			}
		},
		{
			id: 'lastLoginAt',
			label: 'Último Acceso',
			align: 'left',
			render: (_, row: User) => formatLastLogin(row.lastLoginAt)
		},
		{
			id: 'actions',
			label: 'Acciones',
			align: 'center',
			render: (_, row: User) => (
				<ActionMenu
					actions={[
						{
							label: 'Editar',
							icon: <EditIcon />,
							onClick: () => handleUserAction('edit', row)
						},
						{
							label: 'Gestionar Roles',
							icon: <PersonAddIcon />,
							onClick: () => handleUserAction('manage-roles', row)
						},
						{
							label: row.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear',
							icon: <BlockIcon />,
							onClick: () => handleUserAction('toggle-block', row),
							color: row.status === 'BLOCKED' ? 'success' : 'warning'
						},
						{
							label: 'Eliminar',
							icon: <DeleteIcon />,
							onClick: () => handleUserAction('delete', row),
							color: 'error'
						}
					]}
				/>
			)
		}
	];

	return (
		<>
			<DataTablePageTemplate
				pageHeader={pageHeaderProps}
				statsData={statsData}
				searchPlaceholder="Buscar usuarios..."
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				filterOptions={filterOptions}
				filterValues={filters}
				onFilterChange={setFilters}
				columns={columns}
				data={filteredUsers}
				loading={data.loading}
				error={data.error}
				emptyMessage="No se encontraron usuarios"
			/>

			<UserRoleDialog
				open={roleDialogOpen}
				user={selectedUser}
				onClose={() => {
					setRoleDialogOpen(false);
					setSelectedUser(null);
				}}
				onSave={handleSaveRoles}
			/>
		</>
	);
}
