import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if database needs seeding
   */
  async needsSeeding(): Promise<boolean> {
    try {
      const userCount = await this.prisma.user.count();
      return userCount === 0;
    } catch (error) {
      this.logger.error('Error checking if database needs seeding:', error);
      return false;
    }
  }

  /**
   * Run database seeding (only if empty)
   */
  async runSeeding(): Promise<{
    success: boolean;
    message: string;
    summary?: {
      programs: number;
      roles: number;
      users: number;
      categories: number;
      maintenanceTypes: number;
      resources: number;
    };
  }> {
    try {
      this.logger.log('🌱 Starting database seeding...');

      // Check if database is already seeded
      const needsSeeding = await this.needsSeeding();
      if (!needsSeeding) {
        this.logger.log('📊 Database already contains data. Skipping seeding.');
        return {
          success: true,
          message: 'Database already contains data. Skipping seeding.'
        };
      }

      this.logger.log('🔄 Database is empty. Starting seeding process...');

      // Run seeding process
      const programs = await this.seedPrograms();
      const { roles, permissions } = await this.seedRolesAndPermissions();
      const users = await this.seedUsers(roles, programs);
      const { categories, maintenanceTypes } = await this.seedCategoriesAndMaintenanceTypes();
      const resources = await this.seedResources(programs, categories, users);
      await this.seedBasicAvailability(resources);

      const summary = {
        programs: programs.length,
        roles: roles.length,
        users: users.length,
        categories: categories.length,
        maintenanceTypes: maintenanceTypes.length,
        resources: resources.length
      };

      this.logger.log('✅ Database seeding completed successfully!');
      this.logger.log(`📋 Summary: ${JSON.stringify(summary, null, 2)}`);

      return {
        success: true,
        message: 'Database seeding completed successfully!',
        summary
      };
    } catch (error) {
      this.logger.error('❌ Error during seeding:', error);
      return {
        success: false,
        message: `Error during seeding: ${error.message}`
      };
    }
  }

  /**
   * Run full database seeding (force seeding even if data exists)
   */
  async runFullSeeding(): Promise<{
    success: boolean;
    message: string;
    summary?: {
      programs: number;
      roles: number;
      users: number;
      categories: number;
      maintenanceTypes: number;
      resources: number;
    };
  }> {
    try {
      this.logger.log('🌱 Starting FULL database seeding (force mode)...');

      const needsSeeding = await this.needsSeeding();
      if (!needsSeeding) {
        this.logger.log('📊 Database already contains data. Skipping seeding.');
        return {
          success: true,
          message: 'Database already contains data. Skipping seeding.'
        };
      }
      
      // Clear existing data first
      await this.clearDatabase();

      this.logger.log('🔄 Starting fresh seeding process...');

      // Run seeding process
      const programs = await this.seedPrograms();
      const { roles, permissions } = await this.seedRolesAndPermissions();
      const users = await this.seedUsers(roles, programs);
      const { categories, maintenanceTypes } = await this.seedCategoriesAndMaintenanceTypes();
      const resources = await this.seedResources(programs, categories, users);
      await this.seedBasicAvailability(resources);

      const summary = {
        programs: programs.length,
        roles: roles.length,
        users: users.length,
        categories: categories.length,
        maintenanceTypes: maintenanceTypes.length,
        resources: resources.length
      };

      this.logger.log('✅ Full database seeding completed successfully!');
      this.logger.log(`📋 Summary: ${JSON.stringify(summary, null, 2)}`);

      return {
        success: true,
        message: 'Full database seeding completed successfully!',
        summary
      };
    } catch (error) {
      this.logger.error('❌ Error during full seeding:', error);
      return {
        success: false,
        message: `Error during full seeding: ${error.message}`
      };
    }
  }

  /**
   * Clear all data from database (for full seeding)
   */
  private async clearDatabase(): Promise<void> {
    this.logger.log('🗑️ Clearing existing database data...');
    
    try {
      // Delete in correct order to avoid foreign key constraints
      await this.prisma.availability.deleteMany();
      await this.prisma.resourceCategory.deleteMany();
      await this.prisma.resource.deleteMany();
      await this.prisma.userRole.deleteMany();
      await this.prisma.rolePermission.deleteMany();
      await this.prisma.category.deleteMany();
      await this.prisma.role.deleteMany();
      await this.prisma.permission.deleteMany();
      await this.prisma.user.deleteMany();
      await this.prisma.program.deleteMany();
      
      this.logger.log('✅ Database cleared successfully');
    } catch (error) {
      this.logger.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  private async seedPrograms() {
    this.logger.log('📚 Seeding Programs...');
    
    const programsData = [
      {
        name: 'Ingeniería de Sistemas',
        code: 'ING-SIS',
        description: 'Programa de Ingeniería de Sistemas',
        facultyName: 'Facultad de Ingeniería'
      },
      {
        name: 'Medicina',
        code: 'MED-GEN',
        description: 'Programa de Medicina General',
        facultyName: 'Facultad de Ciencias de la Salud'
      },
      {
        name: 'Derecho',
        code: 'DER-GEN',
        description: 'Programa de Derecho',
        facultyName: 'Facultad de Humanidades'
      },
      {
        name: 'Administración de Empresas',
        code: 'ADM-EMP',
        description: 'Programa de Administración de Empresas',
        facultyName: 'Facultad de Ciencias Empresariales'
      }
    ];

    const programs = [];
    for (const programData of programsData) {
      const program = await this.prisma.program.create({
        data: programData
      });
      programs.push(program);
    }

    return programs;
  }

  private async seedRolesAndPermissions() {
    this.logger.log('👥 Seeding Roles and Permissions...');

    // Create permissions first
    const permissionsData = [
      // Auth permissions
      { name: 'auth:login', resource: 'auth', action: 'login', scope: 'global' },
      { name: 'auth:logout', resource: 'auth', action: 'logout', scope: 'own' },
      { name: 'users:create', resource: 'users', action: 'create', scope: 'global' },
      { name: 'users:read', resource: 'users', action: 'read', scope: 'global' },
      { name: 'users:update', resource: 'users', action: 'update', scope: 'own' },
      { name: 'users:delete', resource: 'users', action: 'delete', scope: 'global' },
      
      // Resource permissions
      { name: 'resources:create', resource: 'resources', action: 'create', scope: 'program' },
      { name: 'resources:read', resource: 'resources', action: 'read', scope: 'global' },
      { name: 'resources:update', resource: 'resources', action: 'update', scope: 'program' },
      { name: 'resources:delete', resource: 'resources', action: 'delete', scope: 'program' },
      
      // Reservation permissions
      { name: 'reservations:create', resource: 'reservations', action: 'create', scope: 'own' },
      { name: 'reservations:read', resource: 'reservations', action: 'read', scope: 'program' },
      { name: 'reservations:update', resource: 'reservations', action: 'update', scope: 'own' },
      { name: 'reservations:delete', resource: 'reservations', action: 'delete', scope: 'own' },
      { name: 'reservations:approve', resource: 'reservations', action: 'approve', scope: 'program' },
      
      // Reports permissions
      { name: 'reports:generate', resource: 'reports', action: 'generate', scope: 'program' },
      { name: 'reports:export', resource: 'reports', action: 'export', scope: 'program' },
      
      // Maintenance permissions
      { name: 'maintenance:create', resource: 'maintenance', action: 'create', scope: 'global' },
      { name: 'maintenance:read', resource: 'maintenance', action: 'read', scope: 'global' },
      { name: 'maintenance:update', resource: 'maintenance', action: 'update', scope: 'program' }
    ];

    const permissions = [];
    for (const permissionData of permissionsData) {
      const permission = await this.prisma.permission.create({
        data: permissionData
      });
      permissions.push(permission);
    }

    // Create predefined roles
    const rolesData = [
      {
        name: 'Estudiante',
        description: 'Estudiante de la universidad',
        isPredefined: true,
        category: 'ACADEMIC',
        permissions: ['auth:login', 'auth:logout', 'users:update', 'reservations:create', 'reservations:read', 'reservations:update', 'reservations:delete', 'resources:read', 'maintenance:create']
      },
      {
        name: 'Docente',
        description: 'Docente de la universidad',
        isPredefined: true,
        category: 'ACADEMIC',
        permissions: ['auth:login', 'auth:logout', 'users:update', 'reservations:create', 'reservations:read', 'reservations:update', 'reservations:delete', 'resources:read', 'maintenance:create', 'reports:generate']
      },
      {
        name: 'Administrador General',
        description: 'Administrador general del sistema',
        isPredefined: true,
        category: 'ADMIN',
        permissions: permissionsData.map(p => p.name) // All permissions
      },
      {
        name: 'Administrador de Programa',
        description: 'Administrador de programa académico',
        isPredefined: true,
        category: 'ADMIN',
        permissions: ['auth:login', 'auth:logout', 'users:read', 'users:update', 'resources:create', 'resources:read', 'resources:update', 'resources:delete', 'reservations:read', 'reservations:approve', 'reports:generate', 'reports:export', 'maintenance:read', 'maintenance:update']
      },
      {
        name: 'Vigilante',
        description: 'Personal de vigilancia',
        isPredefined: true,
        category: 'SECURITY',
        permissions: ['auth:login', 'auth:logout', 'reservations:read', 'resources:read']
      },
      {
        name: 'Administrativo General',
        description: 'Personal administrativo general',
        isPredefined: true,
        category: 'OPERATIONAL',
        permissions: ['auth:login', 'auth:logout', 'users:read', 'reservations:read', 'resources:read', 'reports:generate', 'maintenance:create', 'maintenance:read']
      }
    ];

    const roles = [];
    for (const roleData of rolesData) {
      const { permissions: rolePermissions, ...role } = roleData;
      const createdRole = await this.prisma.role.create({
        data: role
      });

      // Assign permissions to role
      for (const permissionName of rolePermissions) {
        const permission = permissions.find(p => p.name === permissionName);
        if (permission) {
          await this.prisma.rolePermission.create({
            data: {
              roleId: createdRole.id,
              permissionId: permission.id
            }
          });
        }
      }

      roles.push(createdRole);
    }

    return { roles, permissions };
  }

  private async seedUsers(roles: any[], programs: any[]) {
    this.logger.log('👤 Seeding Users...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const usersData = [
      {
        email: 'admin@ufps.edu.co',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'General',
        isActive: true,
        isEmailVerified: true,
        roleName: 'Administrador General'
      },
      {
        email: 'admin.sistemas@ufps.edu.co',
        username: 'admin.sistemas',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistemas',
        isActive: true,
        isEmailVerified: true,
        roleName: 'Administrador de Programa',
        programCode: 'ING-SIS'
      },
      {
        email: 'docente@ufps.edu.co',
        username: 'docente',
        password: hashedPassword,
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        isActive: true,
        isEmailVerified: true,
        roleName: 'Docente'
      },
      {
        email: 'estudiante@ufps.edu.co',
        username: 'estudiante',
        password: hashedPassword,
        firstName: 'María',
        lastName: 'González',
        isActive: true,
        isEmailVerified: true,
        roleName: 'Estudiante'
      },
      {
        email: 'vigilante@ufps.edu.co',
        username: 'vigilante',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Ramírez',
        isActive: true,
        isEmailVerified: true,
        roleName: 'Vigilante'
      }
    ];

    const users = [];
    for (const userData of usersData) {
      const { roleName, programCode, ...user } = userData;
      const createdUser = await this.prisma.user.create({
        data: user
      });

      // Assign role to user
      const role = roles.find(r => r.name === roleName);
      const program = programCode ? programs.find(p => p.code === programCode) : null;

      if (role) {
        await this.prisma.userRole.create({
          data: {
            userId: createdUser.id,
            roleId: role.id,
            programId: program?.id || null
          }
        });
      }

      users.push(createdUser);
    }

    return users;
  }

  private async seedCategoriesAndMaintenanceTypes() {
    this.logger.log('🏷️ Seeding Categories and Maintenance Types...');

    // Seed Categories (RF-02: minimum categories that cannot be deleted)
    const categoriesData = [
      { 
        name: 'Salón', 
        description: 'Salones de clase tradicionales', 
        color: '#3B82F6', 
        isDefault: true, 
        sortOrder: 1,
        type: 'RESOURCE_TYPE',
        subtype: 'ROOM',
        code: 'SALON',
        service: 'resources-service'
      },
      { 
        name: 'Laboratorio', 
        description: 'Laboratorios especializados', 
        color: '#10B981', 
        isDefault: true, 
        sortOrder: 2,
        type: 'RESOURCE_TYPE',
        subtype: 'ROOM',
        code: 'LAB',
        service: 'resources-service'
      },
      { 
        name: 'Auditorio', 
        description: 'Auditorios y espacios grandes', 
        color: '#8B5CF6', 
        isDefault: true, 
        sortOrder: 3,
        type: 'RESOURCE_TYPE',
        subtype: 'ROOM',
        code: 'AUDIT',
        service: 'resources-service'
      },
      { 
        name: 'Equipo Multimedia', 
        description: 'Equipos audiovisuales', 
        color: '#F59E0B', 
        isDefault: true, 
        sortOrder: 4,
        type: 'RESOURCE_TYPE',
        subtype: 'EQUIPMENT',
        code: 'MULTIMEDIA',
        service: 'resources-service'
      },
      { 
        name: 'Biblioteca', 
        description: 'Espacios de biblioteca', 
        color: '#EF4444', 
        isDefault: false, 
        sortOrder: 5,
        type: 'RESOURCE_TYPE',
        subtype: 'ROOM',
        code: 'LIBRARY',
        service: 'resources-service'
      },
      { 
        name: 'Oficina', 
        description: 'Oficinas administrativas', 
        color: '#6B7280', 
        isDefault: false, 
        sortOrder: 6,
        type: 'RESOURCE_TYPE',
        subtype: 'ROOM',
        code: 'OFFICE',
        service: 'resources-service'
      }
    ];

    const categories = [];
    for (const categoryData of categoriesData) {
      const category = await this.prisma.category.create({
        data: categoryData
      });
      categories.push(category);
    }

    // Seed Maintenance Types (RF-06: minimum maintenance types) as Categories
    const maintenanceTypesData = [
      { 
        name: 'PREVENTIVO', 
        description: 'Mantenimiento preventivo programado', 
        sortOrder: 1, 
        isActive: true,
        type: 'MAINTENANCE_TYPE',
        subtype: 'SCHEDULED',
        code: 'PREV',
        service: 'resources-service',
        metadata: { isDefault: true, color: '#10B981' }
      },
      { 
        name: 'CORRECTIVO', 
        description: 'Mantenimiento correctivo por fallas', 
        sortOrder: 2, 
        isActive: true,
        type: 'MAINTENANCE_TYPE',
        subtype: 'REACTIVE',
        code: 'CORR',
        service: 'resources-service',
        metadata: { isDefault: true, color: '#F59E0B' }
      },
      { 
        name: 'EMERGENCIA', 
        description: 'Mantenimiento de emergencia', 
        sortOrder: 3, 
        isActive: true,
        type: 'MAINTENANCE_TYPE',
        subtype: 'EMERGENCY',
        code: 'EMER',
        service: 'resources-service',
        metadata: { isDefault: true, color: '#EF4444' }
      },
      { 
        name: 'LIMPIEZA', 
        description: 'Limpieza y aseo', 
        sortOrder: 4, 
        isActive: true,
        type: 'MAINTENANCE_TYPE',
        subtype: 'CLEANING',
        code: 'CLEAN',
        service: 'resources-service',
        metadata: { isDefault: true, color: '#3B82F6' }
      }
    ];

    const maintenanceTypes = [];
    for (const maintenanceTypeData of maintenanceTypesData) {
      const maintenanceType = await this.prisma.category.create({
        data: maintenanceTypeData
      });
      maintenanceTypes.push(maintenanceType);
    }

    // Seed Role Categories (AUTH/ROLE) for auth-service
    const roleCategoriesData = [
      {
        name: 'Académico',
        description: 'Roles académicos (estudiantes, docentes)',
        sortOrder: 1,
        isActive: true,
        type: 'AUTH',
        subtype: 'ROLE',
        code: 'ACADEMIC',
        service: 'auth-service',
        metadata: { isDefault: true, color: '#3B82F6' }
      },
      {
        name: 'Administrativo',
        description: 'Roles administrativos y de gestión',
        sortOrder: 2,
        isActive: true,
        type: 'AUTH',
        subtype: 'ROLE',
        code: 'ADMIN',
        service: 'auth-service',
        metadata: { isDefault: true, color: '#EF4444' }
      },
      {
        name: 'Seguridad',
        description: 'Roles de seguridad y vigilancia',
        sortOrder: 3,
        isActive: true,
        type: 'AUTH',
        subtype: 'ROLE',
        code: 'SECURITY',
        service: 'auth-service',
        metadata: { isDefault: true, color: '#F59E0B' }
      },
      {
        name: 'Operativo',
        description: 'Roles operativos y de soporte',
        sortOrder: 4,
        isActive: true,
        type: 'AUTH',
        subtype: 'ROLE',
        code: 'OPERATIONAL',
        service: 'auth-service',
        metadata: { isDefault: false, color: '#10B981' }
      }
    ];

    const roleCategories = [];
    for (const roleCategoryData of roleCategoriesData) {
      const roleCategory = await this.prisma.category.create({
        data: roleCategoryData
      });
      roleCategories.push(roleCategory);
    }

    return { categories, maintenanceTypes, roleCategories };
  }

  private async seedResources(programs: any[], categories: any[], users: any[]) {
    this.logger.log('🏢 Seeding Resources...');
    
    const adminUser = users.find(u => u.username === 'admin');
    
    const resourcesData = [
      {
        name: 'Aula 101',
        code: 'AULA-101',
        description: 'Salón de clases con capacidad para 40 estudiantes',
        type: 'ROOM',
        capacity: 40,
        location: 'Edificio A - Piso 1',
        status: 'AVAILABLE',
        programCode: 'ING-SIS',
        categoryName: 'Salón',
        attributes: {
          hasProjector: true,
          hasAirConditioning: true,
          hasWhiteboard: true
        }
      },
      {
        name: 'Laboratorio de Sistemas',
        code: 'LAB-SIS-01',
        description: 'Laboratorio de sistemas con 30 computadores',
        type: 'LABORATORY',
        capacity: 30,
        location: 'Edificio B - Piso 2',
        status: 'AVAILABLE',
        programCode: 'ING-SIS',
        categoryName: 'Laboratorio',
        attributes: {
          computers: 30,
          hasProjector: true,
          hasAirConditioning: true,
          software: ['Visual Studio', 'IntelliJ', 'MySQL']
        }
      },
      {
        name: 'Auditorio Principal',
        code: 'AUD-PRIN',
        description: 'Auditorio principal con capacidad para 200 personas',
        type: 'AUDITORIUM',
        capacity: 200,
        location: 'Edificio Central',
        status: 'AVAILABLE',
        programCode: null,
        categoryName: 'Auditorio',
        attributes: {
          hasSound: true,
          hasLighting: true,
          hasProjector: true,
          hasStage: true
        }
      },
      {
        name: 'Proyector Epson',
        code: 'PROJ-EPS-01',
        description: 'Proyector portátil Epson',
        type: 'EQUIPMENT',
        location: 'Almacén de equipos',
        status: 'AVAILABLE',
        programCode: null,
        categoryName: 'Equipo Multimedia',
        attributes: {
          brand: 'Epson',
          model: 'PowerLite',
          resolution: '1920x1080',
          portable: true
        }
      }
    ];

    const resources = [];
    for (const resourceData of resourcesData) {
      const { programCode, categoryName, ...resource } = resourceData;
      const program = programCode ? programs.find(p => p.code === programCode) : null;
      const category = categories.find(c => c.name === categoryName);

      const createdResource = await this.prisma.resource.create({
        data: {
          ...resource,
          programId: program?.id || null,
          categoryId: category?.id || null
        }
      });

      // Create resource-category relationship
      if (category && adminUser) {
        await this.prisma.resourceCategory.create({
          data: {
            resourceId: createdResource.id,
            categoryId: category.id,
            assignedBy: adminUser.id
          }
        });
      }

      resources.push(createdResource);
    }

    return resources;
  }

  private async seedBasicAvailability(resources: any[]) {
    this.logger.log('📅 Seeding Basic Availability...');
    
    // Create basic availability for all resources
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const getDay = {'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6};
    
    for (const resource of resources) {
      for (const day of daysOfWeek) {
        await this.prisma.availability.create({
          data: {
            resourceId: resource.id,
            dayOfWeek: getDay[day],
            startTime: '06:00:00',
            endTime: day === 'SATURDAY' ? '18:00:00' : '22:00:00',
            isActive: true
          }
        });
      }
    }
  }
}
