import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Check if database is already seeded
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("📊 Database already contains data. Skipping seeding.");
    return;
  }

  console.log("🔄 Database is empty. Starting seeding process...");

  try {
    // 1. Seed Programs (Academic Programs)
    console.log("📚 Seeding Programs...");
    const programs = await seedPrograms();

    // 2. Seed Roles and Permissions
    console.log("👥 Seeding Roles and Permissions...");
    const { roles, permissions } = await seedRolesAndPermissions();

    // 3. Seed Users
    console.log("👤 Seeding Users...");
    const users = await seedUsers(roles, programs);

    // 4. Seed Categories and Maintenance Types
    console.log("🏷️ Seeding Categories and Maintenance Types...");
    const { categories, maintenanceTypes } =
      await seedCategoriesAndMaintenanceTypes();

    // 5. Seed Resources
    console.log("🏢 Seeding Resources...");
    const resources = await seedResources(programs, categories, users);

    // 6. Seed Basic Availability
    console.log("📅 Seeding Basic Availability...");
    await seedBasicAvailability(resources);

    console.log("✅ Database seeding completed successfully!");
    console.log("📋 Summary:");
    console.log(`   - Programs: ${programs.length}`);
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Maintenance Types: ${maintenanceTypes.length}`);
    console.log(`   - Resources: ${resources.length}`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

async function seedPrograms() {
  const programsData = [
    {
      name: "Ingeniería de Sistemas",
      code: "ING-SIS",
      description: "Programa de Ingeniería de Sistemas",
      facultyName: "Facultad de Ingeniería",
    },
    {
      name: "Medicina",
      code: "MED-GEN",
      description: "Programa de Medicina General",
      facultyName: "Facultad de Ciencias de la Salud",
    },
    {
      name: "Derecho",
      code: "DER-GEN",
      description: "Programa de Derecho",
      facultyName: "Facultad de Humanidades",
    },
    {
      name: "Administración de Empresas",
      code: "ADM-EMP",
      description: "Programa de Administración de Empresas",
      facultyName: "Facultad de Ciencias Empresariales",
    },
  ];

  const programs = [];
  for (const programData of programsData) {
    const program = await prisma.program.create({
      data: programData,
    });
    programs.push(program);
  }

  return programs;
}

async function seedRolesAndPermissions() {
  // Create permissions first
  const permissionsData = [
    // Auth permissions
    { name: "auth:login", resource: "auth", action: "login", scope: "global" },
    { name: "auth:logout", resource: "auth", action: "logout", scope: "own" },
    {
      name: "users:create",
      resource: "users",
      action: "create",
      scope: "global",
    },
    { name: "users:read", resource: "users", action: "read", scope: "global" },
    { name: "users:update", resource: "users", action: "update", scope: "own" },
    {
      name: "users:delete",
      resource: "users",
      action: "delete",
      scope: "global",
    },

    // Resource permissions
    {
      name: "resources:create",
      resource: "resources",
      action: "create",
      scope: "program",
    },
    {
      name: "resources:read",
      resource: "resources",
      action: "read",
      scope: "global",
    },
    {
      name: "resources:update",
      resource: "resources",
      action: "update",
      scope: "program",
    },
    {
      name: "resources:delete",
      resource: "resources",
      action: "delete",
      scope: "program",
    },

    // Reservation permissions
    {
      name: "reservations:create",
      resource: "reservations",
      action: "create",
      scope: "own",
    },
    {
      name: "reservations:read",
      resource: "reservations",
      action: "read",
      scope: "program",
    },
    {
      name: "reservations:update",
      resource: "reservations",
      action: "update",
      scope: "own",
    },
    {
      name: "reservations:delete",
      resource: "reservations",
      action: "delete",
      scope: "own",
    },
    {
      name: "reservations:approve",
      resource: "reservations",
      action: "approve",
      scope: "program",
    },

    // Reports permissions
    {
      name: "reports:generate",
      resource: "reports",
      action: "generate",
      scope: "program",
    },
    {
      name: "reports:export",
      resource: "reports",
      action: "export",
      scope: "program",
    },

    // Maintenance permissions
    {
      name: "maintenance:create",
      resource: "maintenance",
      action: "create",
      scope: "global",
    },
    {
      name: "maintenance:read",
      resource: "maintenance",
      action: "read",
      scope: "global",
    },
    {
      name: "maintenance:update",
      resource: "maintenance",
      action: "update",
      scope: "program",
    },
  ];

  const permissions = [];
  for (const permissionData of permissionsData) {
    const permission = await prisma.permission.create({
      data: permissionData,
    });
    permissions.push(permission);
  }

  // Create predefined roles
  const rolesData = [
    {
      name: "Estudiante",
      description: "Estudiante de la universidad",
      isPredefined: true,
      category: "ACADEMIC",
      permissions: [
        "auth:login",
        "auth:logout",
        "users:update",
        "reservations:create",
        "reservations:read",
        "reservations:update",
        "reservations:delete",
        "resources:read",
        "maintenance:create",
      ],
    },
    {
      name: "Docente",
      description: "Docente de la universidad",
      isPredefined: true,
      category: "ACADEMIC",
      permissions: [
        "auth:login",
        "auth:logout",
        "users:update",
        "reservations:create",
        "reservations:read",
        "reservations:update",
        "reservations:delete",
        "resources:read",
        "maintenance:create",
        "reports:generate",
      ],
    },
    {
      name: "Administrador General",
      description: "Administrador general del sistema",
      isPredefined: true,
      category: "ADMIN",
      permissions: permissionsData.map((p) => p.name), // All permissions
    },
    {
      name: "Administrador de Programa",
      description: "Administrador de programa académico",
      isPredefined: true,
      category: "ADMIN",
      permissions: [
        "auth:login",
        "auth:logout",
        "users:read",
        "users:update",
        "resources:create",
        "resources:read",
        "resources:update",
        "resources:delete",
        "reservations:read",
        "reservations:approve",
        "reports:generate",
        "reports:export",
        "maintenance:read",
        "maintenance:update",
      ],
    },
    {
      name: "Vigilante",
      description: "Personal de vigilancia",
      isPredefined: true,
      category: "SECURITY",
      permissions: [
        "auth:login",
        "auth:logout",
        "reservations:read",
        "resources:read",
      ],
    },
    {
      name: "Administrativo General",
      description: "Personal administrativo general",
      isPredefined: true,
      category: "OPERATIONAL",
      permissions: [
        "auth:login",
        "auth:logout",
        "users:read",
        "reservations:read",
        "resources:read",
        "reports:generate",
        "maintenance:create",
        "maintenance:read",
      ],
    },
  ];

  const roles = [];
  for (const roleData of rolesData) {
    const { permissions: rolePermissions, ...role } = roleData;
    const createdRole = await prisma.role.create({
      data: role,
    });

    // Assign permissions to role
    for (const permissionName of rolePermissions) {
      const permission = permissions.find((p) => p.name === permissionName);
      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }

    roles.push(createdRole);
  }

  return { roles, permissions };
}

async function seedUsers(roles: any[], programs: any[]) {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const usersData = [
    {
      email: "admin@ufps.edu.co",
      username: "admin",
      password: hashedPassword,
      firstName: "Administrador",
      lastName: "General",
      isActive: true,
      isEmailVerified: true,
      roleName: "Administrador General",
    },
    {
      email: "admin.sistemas@ufps.edu.co",
      username: "admin.sistemas",
      password: hashedPassword,
      firstName: "Administrador",
      lastName: "Sistemas",
      isActive: true,
      isEmailVerified: true,
      roleName: "Administrador de Programa",
      programCode: "ING-SIS",
    },
    {
      email: "docente@ufps.edu.co",
      username: "docente",
      password: hashedPassword,
      firstName: "Juan Carlos",
      lastName: "Pérez",
      isActive: true,
      isEmailVerified: true,
      roleName: "Docente",
    },
    {
      email: "estudiante@ufps.edu.co",
      username: "estudiante",
      password: hashedPassword,
      firstName: "María",
      lastName: "González",
      isActive: true,
      isEmailVerified: true,
      roleName: "Estudiante",
    },
    {
      email: "vigilante@ufps.edu.co",
      username: "vigilante",
      password: hashedPassword,
      firstName: "Carlos",
      lastName: "Ramírez",
      isActive: true,
      isEmailVerified: true,
      roleName: "Vigilante",
    },
  ];

  const users = [];
  for (const userData of usersData) {
    const { roleName, programCode, ...user } = userData;
    const createdUser = await prisma.user.create({
      data: user,
    });

    // Assign role to user
    const role = roles.find((r) => r.name === roleName);
    const program = programCode
      ? programs.find((p) => p.code === programCode)
      : null;

    if (role) {
      await prisma.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: role.id,
          programId: program?.id || null,
        },
      });
    }

    users.push(createdUser);
  }

  return users;
}

async function seedCategoriesAndMaintenanceTypes() {
  // Seed Categories (RF-02: minimum non-deletable categories)
  const categoriesData = [
    {
      type: "RESOURCE_TYPE",
      subtype: "ROOM",
      name: "Salón",
      code: "SALON",
      description: "Salones de clase",
      color: "#3B82F6",
      isDefault: true,
      sortOrder: 1,
      service: "resources-service",
    },
    {
      type: "RESOURCE_TYPE",
      subtype: "ROOM",
      name: "Laboratorio",
      code: "LABORATORIO",
      description: "Laboratorios especializados",
      color: "#10B981",
      isDefault: true,
      sortOrder: 2,
      service: "resources-service",
    },
    {
      type: "RESOURCE_TYPE",
      subtype: "ROOM",
      name: "Auditorio",
      code: "AUDITORIO",
      description: "Auditorios y salas de conferencias",
      color: "#8B5CF6",
      isDefault: true,
      sortOrder: 3,
      service: "resources-service",
    },
    {
      type: "RESOURCE_TYPE",
      subtype: "EQUIPMENT",
      name: "Equipo Multimedia",
      code: "MULTIMEDIA",
      description: "Equipos audiovisuales",
      color: "#F59E0B",
      isDefault: true,
      sortOrder: 4,
      service: "resources-service",
    },
    {
      type: "RESOURCE_TYPE",
      subtype: "ROOM",
      name: "Biblioteca",
      code: "BIBLIOTECA",
      description: "Espacios de biblioteca",
      color: "#EF4444",
      isDefault: false,
      sortOrder: 5,
      service: "resources-service",
    },
    {
      type: "RESOURCE_TYPE",
      subtype: "ROOM",
      name: "Oficina",
      code: "OFICINA",
      description: "Oficinas administrativas",
      color: "#6B7280",
      isDefault: false,
      sortOrder: 6,
      service: "resources-service",
    },
    // AUTH/ROLE Categories for role management
    {
      type: "AUTH",
      subtype: "ROLE",
      name: "Académico",
      code: "ACADEMIC",
      description: "Roles académicos (estudiantes, docentes)",
      color: "#3B82F6",
      isDefault: true,
      sortOrder: 1,
      service: "auth-service",
    },
    {
      type: "AUTH",
      subtype: "ROLE",
      name: "Administrativo",
      code: "ADMIN",
      description: "Roles administrativos y de gestión",
      color: "#EF4444",
      isDefault: true,
      sortOrder: 2,
      service: "auth-service",
    },
    {
      type: "AUTH",
      subtype: "ROLE",
      name: "Seguridad",
      code: "SECURITY",
      description: "Roles de seguridad y vigilancia",
      color: "#F59E0B",
      isDefault: true,
      sortOrder: 3,
      service: "auth-service",
    },
    {
      type: "AUTH",
      subtype: "ROLE",
      name: "Operativo",
      code: "OPERATIONAL",
      description: "Roles operativos y de soporte",
      color: "#10B981",
      isDefault: false,
      sortOrder: 4,
      service: "auth-service",
    },
  ];

  const categories = [];
  for (const categoryData of categoriesData) {
    const category = await prisma.category.create({
      data: categoryData,
    });
    categories.push(category);
  }

  // Seed Maintenance Types (RF-06: minimum maintenance types) as Categories
  const maintenanceTypesData = [
    {
      type: "MAINTENANCE_TYPE",
      subtype: "SCHEDULED",
      name: "PREVENTIVO",
      code: "PREVENTIVO",
      description: "Mantenimiento preventivo programado",
      color: "#10B981",
      sortOrder: 1,
      isDefault: true,
      service: "resources-service",
    },
    {
      type: "MAINTENANCE_TYPE",
      subtype: "REACTIVE",
      name: "CORRECTIVO",
      code: "CORRECTIVO",
      description: "Mantenimiento correctivo por fallas",
      color: "#F59E0B",
      sortOrder: 2,
      isDefault: true,
      service: "resources-service",
    },
    {
      type: "MAINTENANCE_TYPE",
      subtype: "EMERGENCY",
      name: "EMERGENCIA",
      code: "EMERGENCIA",
      description: "Mantenimiento de emergencia",
      color: "#EF4444",
      sortOrder: 3,
      isDefault: true,
      service: "resources-service",
    },
    {
      type: "MAINTENANCE_TYPE",
      subtype: "CLEANING",
      name: "LIMPIEZA",
      code: "LIMPIEZA",
      description: "Limpieza y aseo",
      color: "#3B82F6",
      sortOrder: 4,
      isDefault: true,
      service: "resources-service",
    },
  ];

  const maintenanceTypes = [];
  for (const maintenanceTypeData of maintenanceTypesData) {
    const maintenanceType = await prisma.category.create({
      data: maintenanceTypeData,
    });
    maintenanceTypes.push(maintenanceType);
  }

  return { categories, maintenanceTypes };
}

async function seedResources(programs: any[], categories: any[], users: any[]) {
  const adminUser = users.find((u) => u.username === "admin");

  const resourcesData = [
    {
      name: "Aula 101",
      code: "AULA-101",
      description: "Salón de clases con capacidad para 40 estudiantes",
      type: "ROOM",
      capacity: 40,
      location: "Edificio A - Piso 1",
      status: "AVAILABLE",
      programCode: "ING-SIS",
      categoryName: "Salón",
      attributes: {
        hasProjector: true,
        hasAirConditioning: true,
        hasWhiteboard: true,
      },
      defaultSchedule: {
        monday: { start: "06:00", end: "22:00" },
        tuesday: { start: "06:00", end: "22:00" },
        wednesday: { start: "06:00", end: "22:00" },
        thursday: { start: "06:00", end: "22:00" },
        friday: { start: "06:00", end: "22:00" },
        saturday: { start: "06:00", end: "18:00" },
        sunday: { start: null, end: null },
      },
      defaultMaintenance: {
        type: "LIMPIEZA",
        frequency: "every_2_days",
        duration: 30,
        startTime: "12:00",
      },
    },
    {
      name: "Laboratorio de Sistemas",
      code: "LAB-SIS-01",
      description: "Laboratorio de sistemas con 30 computadores",
      type: "LABORATORY",
      capacity: 30,
      location: "Edificio B - Piso 2",
      status: "AVAILABLE",
      programCode: "ING-SIS",
      categoryName: "Laboratorio",
      attributes: {
        computers: 30,
        hasProjector: true,
        hasAirConditioning: true,
        software: ["Visual Studio", "IntelliJ", "MySQL"],
      },
    },
    {
      name: "Auditorio Principal",
      code: "AUD-PRIN",
      description: "Auditorio principal con capacidad para 200 personas",
      type: "AUDITORIUM",
      capacity: 200,
      location: "Edificio Central",
      status: "AVAILABLE",
      programCode: null,
      categoryName: "Auditorio",
      attributes: {
        hasSound: true,
        hasLighting: true,
        hasProjector: true,
        hasStage: true,
      },
    },
    {
      name: "Proyector Epson",
      code: "PROJ-EPS-01",
      description: "Proyector portátil Epson",
      type: "EQUIPMENT",
      capacity: undefined,
      location: "Almacén de equipos",
      status: "AVAILABLE",
      programCode: null,
      categoryName: "Equipo Multimedia",
      attributes: {
        brand: "Epson",
        model: "PowerLite",
        resolution: "1920x1080",
        portable: true,
      },
    },
  ];

  const resources = [];
  for (const resourceData of resourcesData) {
    const { programCode, categoryName, ...resource } = resourceData;
    const program = programCode
      ? programs.find((p) => p.code === programCode)
      : null;
    const category = categories.find((c) => c.name === categoryName);

    const createdResource = await prisma.resource.create({
      data: {
        ...resource,
        programId: program?.id || null,
        categoryId: category?.id || null,
      },
    });

    // Create resource-category relationship
    if (category && adminUser) {
      await prisma.resourceCategory.create({
        data: {
          resourceId: createdResource.id,
          categoryId: category.id,
          assignedBy: adminUser.id,
        },
      });
    }

    resources.push(createdResource);
  }

  return resources;
}

async function seedBasicAvailability(resources: any[]) {
  // Create basic availability for all resources
  //const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const daysOfWeek = [1, 2, 3, 4, 5, 6];

  for (const resource of resources) {
    for (const day of daysOfWeek) {
      await prisma.availability.create({
        data: {
          resourceId: resource.id,
          dayOfWeek: day,
          startTime: "06:00:00",
          endTime: day === 6 ? "18:00:00" : "22:00:00",
          isActive: true,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
