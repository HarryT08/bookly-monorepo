// Resource types for Bookly frontend
export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: string;
  capacity: number;
  location?: string;
  isActive: boolean;
  isAvailable: boolean;
  academicProgramId?: string;
  categories: Category[];
  attributes: ResourceAttributes;
  availability?: ResourceAvailability;
  maintenanceHistory?: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  type: string;
  subtype?: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  service: string;
}

export interface ResourceAttributes {
  equipment?: string[];
  accessibility?: string[];
  specialConditions?: string[];
  technicalSpecs?: Record<string, any>;
}

export interface ResourceAvailability {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  exceptions?: AvailabilityException[];
}

export interface AvailabilityException {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isBlocked: boolean;
  reason?: string;
}

export interface MaintenanceRecord {
  id: string;
  resourceId: string;
  type: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reportedBy: string;
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cost?: number;
  notes?: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  facultyId?: string;
}

// Request/Response types
export interface CreateResourceRequest {
  name: string;
  description?: string;
  type: string;
  capacity: number;
  location?: string;
  academicProgramId?: string;
  categoryIds: string[];
  attributes: ResourceAttributes;
  availability?: Omit<ResourceAvailability, 'id' | 'resourceId'>[];
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {
  id: string;
}

export interface ResourceListRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  categoryId?: string;
  academicProgramId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  sortBy?: 'name' | 'type' | 'capacity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ResourceListResponse {
  success: boolean;
  data: Resource[];
  message?: string;
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ImportResourcesRequest {
  csvData: string;
  programId?: string;
  defaultAvailability?: boolean;
}

export interface ImportResourcesResponse {
  imported: number;
  failed: number;
  errors?: string[];
}

// Filter types for UI
export interface ResourceFilters {
  search: string;
  category: string;
  type: string;
  program: string;
  status: 'all' | 'active' | 'inactive' | 'available' | 'unavailable';
  hideCompleted: boolean;
}

export interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}
