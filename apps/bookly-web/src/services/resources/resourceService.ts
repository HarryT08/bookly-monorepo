import { api, buildServiceUrl } from '@/services/http/client';
import type { ApiResponse, PaginationParams, FilterParams, PaginatedResponse } from '@/services/http/types';
import { SERVICES, RESOURCES_ENDPOINTS } from '@/services/config/services';
import type {
  Resource,
  Category,
  AcademicProgram,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceListRequest,
  ResourceListResponse,
  ImportResourcesRequest,
  ImportResourcesResponse,
  MaintenanceRecord,
} from './types';

// Service URLs - mapped to resources-service endpoints via API Gateway
const RESOURCES_SERVICE = SERVICES.RESOURCES;

export const resourceService = {
  // Resource CRUD operations
  async getResources(filters?: FilterParams & PaginationParams): Promise<ResourceListResponse> {
    const searchParams = new URLSearchParams();
    
    if (filters?.page) searchParams.set('page', filters.page.toString());
    if (filters?.limit) searchParams.set('limit', filters.limit.toString());
    if (filters?.search) searchParams.set('search', filters.search);
    if (filters?.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString());
    if (filters?.category) searchParams.set('category', filters.category);
    if (filters?.program) searchParams.set('program', filters.program);
    if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString 
      ? `${buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.PAGINATED)}?${queryString}`
      : buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.PAGINATED);
      
    const response = await api.get<Resource[]>(url);
    
    // Handle backend ResponseUtil format
    if (response.success && response.data && response.meta) {
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      } as ResourceListResponse;
    }
    
    throw new Error(response.message || 'Failed to fetch resources');
  },

  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Resource not found');
  },

  async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    const response = await api.post<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, ''),
      resourceData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create resource');
  },

  async updateResource(id: string, resourceData: Partial<UpdateResourceRequest>): Promise<Resource> {
    const response = await api.patch<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, id),
      resourceData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update resource');
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(buildServiceUrl(RESOURCES_SERVICE, `${id}`));
  },

  async toggleResourceStatus(id: string): Promise<Resource> {
    const response = await api.patch<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, `${id}/toggle-status`)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to toggle resource status');
  },

  // Categories & Programs  
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(
      buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.CATEGORIES)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch categories');
  },

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>(
      buildServiceUrl(RESOURCES_SERVICE, 'resource-categories'),
      categoryData
    );
    return response.data!;
  },

  async getAcademicPrograms(): Promise<AcademicProgram[]> {
    const response = await api.get<AcademicProgram[]>(
      buildServiceUrl(RESOURCES_SERVICE, 'academic-programs')
    );
    return response.data!;
  },

  // Import/Export
  async importResources(importData: ImportResourcesRequest): Promise<ImportResourcesResponse> {
    const response = await api.post<ImportResourcesResponse>(
      buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.IMPORT_CSV),
      importData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to import resources');
  },

  async exportResources(filters?: FilterParams & PaginationParams): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (filters?.page) searchParams.set('page', filters.page.toString());
    if (filters?.limit) searchParams.set('limit', filters.limit.toString());
    if (filters?.search) searchParams.set('search', filters.search);
    if (filters?.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString());
    if (filters?.category) searchParams.set('category', filters.category);
    if (filters?.program) searchParams.set('program', filters.program);
    if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString 
      ? `${buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.EXPORT)}?${queryString}`
      : buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.EXPORT);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bookly_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },

  // Maintenance
  async getMaintenanceHistory(resourceId: string): Promise<MaintenanceRecord[]> {
    const response = await api.get<MaintenanceRecord[]>(
      buildServiceUrl(RESOURCES_SERVICE, `${resourceId}/maintenance`)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch maintenance history');
  },

  async reportMaintenance(resourceId: string, maintenanceData: Omit<MaintenanceRecord, 'id' | 'resourceId'>): Promise<MaintenanceRecord> {
    const response = await api.post<MaintenanceRecord>(
      buildServiceUrl(RESOURCES_SERVICE, `${resourceId}/maintenance`),
      maintenanceData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to report maintenance');
  },

  // Resource availability
  async checkAvailability(resourceId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    const response = await api.get<{ available: boolean }>(
      buildServiceUrl(RESOURCES_SERVICE, `${resourceId}/availability/check`),
      {
        searchParams: {
          date,
          startTime,
          endTime,
        },
      }
    );
    
    if (response.success && response.data) {
      return response.data.available;
    }
    
    throw new Error(response.message || 'Failed to check availability');
  },

  // Bulk operations
  async bulkUpdateResources(resourceIds: string[], updates: Partial<UpdateResourceRequest>): Promise<Resource[]> {
    const response = await api.patch<Resource[]>(
      buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.BULK_UPDATE),
      {
        resourceIds,
        updates,
      }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to bulk update resources');
  },

  async bulkDeleteResources(resourceIds: string[]): Promise<void> {
    const response = await api.delete(buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.BULK_DELETE), {
      json: { resourceIds },
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk delete resources');
    }
  },

  // Statistics
  async getResourceStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    available: number;
    byCategory: Record<string, number>;
    byProgram: Record<string, number>;
  }> {
    const response = await api.get<{
      total: number;
      active: number;
      inactive: number;
      available: number;
      byCategory: Record<string, number>;
      byProgram: Record<string, number>;
    }>(buildServiceUrl(RESOURCES_SERVICE, RESOURCES_ENDPOINTS.STATISTICS));
    return response.data!;
  },
};

export default resourceService;
