import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { authServices, roleServices, permissionServices, userServices } from '@services/auth/services';
import { transformUser, transformRole, transformPermission } from '@services/auth/models';
import type {
	User,
	CreateRoleRequest,
	UpdateRoleRequest,
	RoleWithPermissions,
	CreatePermissionRequest,
	UpdatePermissionRequest,
	PermissionWithDetails,
	AssignRoleRequest,
	RegisterRequest
} from '@services/auth/types';

// Store auth state
let currentUser: User | null = null;
let isAuthenticated = false;
let authToken: string | null = null;

/**
 * Main authentication hook
 */
export function useAuth() {
	const [user, setUser] = useState<User | null>(currentUser);
	const [loading, setLoading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
	const router = useRouter();

	// Initialize auth state from localStorage
	useEffect(() => {
		const token = localStorage.getItem('auth_token');
		const userData = localStorage.getItem('user_data');

		if (token && userData) {
			try {
				const parsedUser = JSON.parse(userData);
				currentUser = parsedUser;
				authToken = token;
				isAuthenticated = true;
				setUser(parsedUser);
				setIsLoggedIn(true);
			} catch (error) {
				console.error('Error parsing user data:', error);
				localStorage.removeItem('auth_token');
				localStorage.removeItem('user_data');
			}
		}
	}, []);

	const login = useCallback(async (credentials: { email: string; password: string }): Promise<boolean> => {
		setLoading(true);
		try {
			const response = await authServices.login(credentials);

			if (response.success) {
				const userData = transformUser(response.data.user);
				const token = response.data.token;

				// Store in memory
				currentUser = userData;
				authToken = token;
				isAuthenticated = true;

				// Store in localStorage
				localStorage.setItem('auth_token', token);
				localStorage.setItem('user_data', JSON.stringify(userData));

				setUser(userData);
				setIsLoggedIn(true);

				enqueueSnackbar('Login exitoso', { variant: 'success' });

				return true;
			} else {
				enqueueSnackbar(response.message || 'Error en el login', { variant: 'error' });
				return false;
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Error en el login';
			enqueueSnackbar(errorMessage, { variant: 'error' });
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	const register = useCallback(async (userData: RegisterRequest) => {
		setLoading(true);
		try {
			const response = await authServices.register(userData);

			if (response.success) {
				enqueueSnackbar('Registro exitoso. Verifica tu email.', { variant: 'success' });
				return { success: true };
			} else {
				enqueueSnackbar(response.message || 'Error en el registro', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Register error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setLoading(true);
		try {
			await authServices.logout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			// Clear state regardless of API call result
			currentUser = null;
			authToken = null;
			isAuthenticated = false;

			localStorage.removeItem('auth_token');
			localStorage.removeItem('user_data');

			setUser(null);
			setIsLoggedIn(false);
			setLoading(false);

			enqueueSnackbar('Sesión cerrada', { variant: 'info' });
			router.push('/login');
		}
	}, [router]);

	const updateProfile = useCallback(
		async (data: Partial<User>) => {
			if (!user) return { success: false, error: 'No user logged in' };

			setLoading(true);
			try {
				const response = await authServices.updateProfile(data);

				if (response.success) {
					const updatedUser = transformUser(response.data);
					currentUser = updatedUser;
					setUser(updatedUser);
					localStorage.setItem('user_data', JSON.stringify(updatedUser));

					enqueueSnackbar('Perfil actualizado', { variant: 'success' });
					return { success: true, user: updatedUser };
				} else {
					enqueueSnackbar(response.message || 'Error al actualizar perfil', { variant: 'error' });
					return { success: false, error: response.message };
				}
			} catch (error) {
				console.error('Update profile error:', error);
				enqueueSnackbar('Error de conexión', { variant: 'error' });
				return { success: false, error: 'Error de conexión' };
			} finally {
				setLoading(false);
			}
		},
		[user]
	);

	const refreshProfile = useCallback(async () => {
		if (!isLoggedIn) return;

		setLoading(true);
		try {
			const response = await authServices.getProfile();

			if (response.success) {
				const userData = transformUser(response.data);
				currentUser = userData;
				setUser(userData);
				localStorage.setItem('user_data', JSON.stringify(userData));
			}
		} catch (error) {
			console.error('Refresh profile error:', error);
		} finally {
			setLoading(false);
		}
	}, [isLoggedIn]);

	const hasPermission = useCallback(
		(resource: string, action: string, scope?: string) => {
			if (!user?.permissions) return false;

			return user.permissions.some(
				(permission) =>
					permission.resource === resource &&
					permission.action === action &&
					(!scope || permission.scope === scope)
			);
		},
		[user]
	);

	const hasRole = useCallback(
		(roleName: string) => {
			if (!user?.roles) return false;

			return user.roles.some((role) => role.name === roleName);
		},
		[user]
	);

	const ssoGoogleLogin = useCallback(() => {
		authServices.ssoGoogleLogin();
	}, []);

	const handleSSOCallback = useCallback(async (code: string, _state: string | null) => {
		setLoading(true);
		try {
			const response = await authServices.ssoCallback(code);

			if (response.success) {
				const userData = transformUser(response.data.user);
				const token = response.data.token;

				// Store in memory
				currentUser = userData;
				authToken = token;
				isAuthenticated = true;

				// Store in localStorage
				localStorage.setItem('auth_token', token);
				localStorage.setItem('user_data', JSON.stringify(userData));

				setUser(userData);
				setIsLoggedIn(true);

				enqueueSnackbar('Inicio de sesión SSO exitoso', { variant: 'success' });

				return { success: true, user: userData };
			} else {
				enqueueSnackbar(response.message || 'Error en el callback SSO', { variant: 'error' });
				throw new Error(response.message || 'Error en el callback SSO');
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Error en el callback SSO';
			enqueueSnackbar(errorMessage, { variant: 'error' });
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		// State
		user,
		loading,
		isAuthenticated: isLoggedIn,
		token: authToken,

		// Actions
		login,
		register,
		logout,
		updateProfile,
		refreshProfile,
		ssoGoogleLogin,
		handleSSOCallback,

		// Permissions
		hasPermission,
		hasRole
	};
}

/**
 * Role management hook
 */
export function useRoleManagement() {
	const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0
	});

	const getAllRoles = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
		setLoading(true);
		try {
			const response = await roleServices.getAllRoles(params);

			if (response.success) {
				const transformedRoles = response.data.map((role) => ({
					...transformRole(role),
					...role // Include additional fields like isPredefined, isActive, etc.
				})) as RoleWithPermissions[];

				setRoles(transformedRoles);

				if ('pagination' in response && response.pagination) {
					setPagination(response.pagination as typeof pagination);
				}

				return { success: true, data: transformedRoles };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar roles', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get roles error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const getActiveRoles = useCallback(async () => {
		setLoading(true);
		try {
			const response = await roleServices.getActiveRoles();

			if (response.success) {
				const transformedRoles = response.data.map((role) => ({
					...transformRole(role),
					...role
				})) as RoleWithPermissions[];

				return { success: true, data: transformedRoles };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar roles activos', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get active roles error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const createRole = useCallback(async (data: CreateRoleRequest) => {
		setLoading(true);
		try {
			const response = await roleServices.createRole(data);

			if (response.success) {
				const newRole = {
					...transformRole(response.data),
					...response.data
				} as RoleWithPermissions;

				setRoles((prev) => [...prev, newRole]);
				enqueueSnackbar('Rol creado exitosamente', { variant: 'success' });

				return { success: true, data: newRole };
			} else {
				enqueueSnackbar(response.message || 'Error al crear rol', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Create role error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const updateRole = useCallback(async (id: string, data: UpdateRoleRequest) => {
		setLoading(true);
		try {
			const response = await roleServices.updateRole(id, data);

			if (response.success) {
				const updatedRole = {
					...transformRole(response.data),
					...response.data
				} as RoleWithPermissions;

				setRoles((prev) => prev.map((role) => (role.id === id ? updatedRole : role)));

				enqueueSnackbar('Rol actualizado exitosamente', { variant: 'success' });
				return { success: true, data: updatedRole };
			} else {
				enqueueSnackbar(response.message || 'Error al actualizar rol', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Update role error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteRole = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const response = await roleServices.deleteRole(id);

			if (response.success) {
				setRoles((prev) => prev.filter((role) => role.id !== id));
				enqueueSnackbar('Rol eliminado exitosamente', { variant: 'success' });

				return { success: true };
			} else {
				enqueueSnackbar(response.message || 'Error al eliminar rol', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Delete role error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const assignRole = useCallback(async (data: AssignRoleRequest) => {
		setLoading(true);
		try {
			const response = await roleServices.assignRole(data);

			if (response.success) {
				enqueueSnackbar('Rol asignado exitosamente', { variant: 'success' });
				return { success: true, data: response.data };
			} else {
				enqueueSnackbar(response.message || 'Error al asignar rol', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Assign role error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		// State
		roles,
		loading,
		pagination,

		// Actions
		getAllRoles,
		getActiveRoles,
		createRole,
		updateRole,
		deleteRole,
		assignRole,
		setPagination
	};
}

/**
 * Permission management hook
 */
export function usePermissionManagement() {
	const [permissions, setPermissions] = useState<PermissionWithDetails[]>([]);
	const [loading, setLoading] = useState(false);

	const getAllPermissions = useCallback(
		async (filters?: { resource?: string; action?: string; scope?: string; isActive?: boolean }) => {
			setLoading(true);
			try {
				const response = await permissionServices.getAllPermissions(filters);

				if (response.success) {
					const transformedPermissions = response.data.map((permission) => ({
						...transformPermission(permission),
						...permission
					})) as PermissionWithDetails[];

					setPermissions(transformedPermissions);
					return { success: true, data: transformedPermissions };
				} else {
					enqueueSnackbar(response.message || 'Error al cargar permisos', { variant: 'error' });
					return { success: false, error: response.message };
				}
			} catch (error) {
				console.error('Get permissions error:', error);
				enqueueSnackbar('Error de conexión', { variant: 'error' });
				return { success: false, error: 'Error de conexión' };
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const getActivePermissions = useCallback(async () => {
		setLoading(true);
		try {
			const response = await permissionServices.getActivePermissions();

			if (response.success) {
				const transformedPermissions = response.data.map((permission) => ({
					...transformPermission(permission),
					...permission
				})) as PermissionWithDetails[];

				return { success: true, data: transformedPermissions };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar permisos activos', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get active permissions error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const createPermission = useCallback(async (data: CreatePermissionRequest) => {
		setLoading(true);
		try {
			const response = await permissionServices.createPermission(data);

			if (response.success) {
				const newPermission = {
					...transformPermission(response.data),
					...response.data
				} as PermissionWithDetails;

				setPermissions((prev) => [...prev, newPermission]);
				enqueueSnackbar('Permiso creado exitosamente', { variant: 'success' });

				return { success: true, data: newPermission };
			} else {
				enqueueSnackbar(response.message || 'Error al crear permiso', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Create permission error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const updatePermission = useCallback(async (id: string, data: UpdatePermissionRequest) => {
		setLoading(true);
		try {
			const response = await permissionServices.updatePermission(id, data);

			if (response.success) {
				const updatedPermission = {
					...transformPermission(response.data),
					...response.data
				} as PermissionWithDetails;

				setPermissions((prev) =>
					prev.map((permission) => (permission.id === id ? updatedPermission : permission))
				);

				enqueueSnackbar('Permiso actualizado exitosamente', { variant: 'success' });
				return { success: true, data: updatedPermission };
			} else {
				enqueueSnackbar(response.message || 'Error al actualizar permiso', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Update permission error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const deletePermission = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const response = await permissionServices.deletePermission(id);

			if (response.success) {
				setPermissions((prev) => prev.filter((permission) => permission.id !== id));
				enqueueSnackbar('Permiso eliminado exitosamente', { variant: 'success' });

				return { success: true };
			} else {
				enqueueSnackbar(response.message || 'Error al eliminar permiso', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Delete permission error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const seedDefaultPermissions = useCallback(async () => {
		setLoading(true);
		try {
			const response = await permissionServices.seedDefaultPermissions();

			if (response.success) {
				enqueueSnackbar('Permisos por defecto creados', { variant: 'success' });
				await getAllPermissions(); // Refresh the list

				return { success: true, data: response.data };
			} else {
				enqueueSnackbar(response.message || 'Error al crear permisos por defecto', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Seed permissions error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, [getAllPermissions]);

	return {
		// State
		permissions,
		loading,

		// Actions
		getAllPermissions,
		getActivePermissions,
		createPermission,
		updatePermission,
		deletePermission,
		seedDefaultPermissions
	};
}

/**
 * User management hook
 */
export function useUserManagement() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0
	});

	const getAllUsers = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
		setLoading(true);
		try {
			const response = await userServices.getAllUsers(params);

			if (response.success) {
				const transformedUsers = response.data.map(transformUser);
				setUsers(transformedUsers);

				if ('pagination' in response && response.pagination) {
					setPagination(response.pagination as typeof pagination);
				}

				return { success: true, data: transformedUsers };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar usuarios', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get users error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const getUserById = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const response = await userServices.getUserById(id);

			if (response.success) {
				const user = transformUser(response.data);
				return { success: true, data: user };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar usuario', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get user error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const updateUser = useCallback(async (id: string, data: Partial<User>) => {
		setLoading(true);
		try {
			const response = await userServices.updateUser(id, data);

			if (response.success) {
				const updatedUser = transformUser(response.data);
				setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));

				enqueueSnackbar('Usuario actualizado exitosamente', { variant: 'success' });
				return { success: true, data: updatedUser };
			} else {
				enqueueSnackbar(response.message || 'Error al actualizar usuario', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Update user error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const getUserRoles = useCallback(async (userId: string) => {
		setLoading(true);
		try {
			const response = await userServices.getUserRoles(userId);

			if (response.success) {
				return { success: true, data: response.data };
			} else {
				enqueueSnackbar(response.message || 'Error al cargar roles del usuario', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Get user roles error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const activateUser = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const response = await userServices.activateUser(id);

			if (response.success) {
				const updatedUser = transformUser(response.data);
				setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));

				enqueueSnackbar('Usuario activado exitosamente', { variant: 'success' });
				return { success: true, data: updatedUser };
			} else {
				enqueueSnackbar(response.message || 'Error al activar usuario', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Activate user error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	const deactivateUser = useCallback(async (id: string) => {
		setLoading(true);
		try {
			const response = await userServices.deactivateUser(id);

			if (response.success) {
				const updatedUser = transformUser(response.data);
				setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));

				enqueueSnackbar('Usuario desactivado exitosamente', { variant: 'success' });
				return { success: true, data: updatedUser };
			} else {
				enqueueSnackbar(response.message || 'Error al desactivar usuario', { variant: 'error' });
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.error('Deactivate user error:', error);
			enqueueSnackbar('Error de conexión', { variant: 'error' });
			return { success: false, error: 'Error de conexión' };
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		// State
		users,
		loading,
		pagination,

		// Actions
		getAllUsers,
		getUserById,
		updateUser,
		getUserRoles,
		activateUser,
		deactivateUser,
		setPagination
	};
}

export default useAuth;
