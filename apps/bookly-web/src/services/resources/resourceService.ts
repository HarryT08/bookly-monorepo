import { api, buildServiceUrl } from '../http/client';
import type { ApiResponse } from '../http/types';
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

const RESOURCES_SERVICE = 'resources';

export const resourceService = {
  // Resource CRUD operations
  async getResources(params?: ResourceListRequest): Promise<ResourceListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString 
      ? `${buildServiceUrl(RESOURCES_SERVICE, '')}?${queryString}`
      : buildServiceUrl(RESOURCES_SERVICE, '');
    const response = await api.get<ResourceListResponse>(url);
    return response.data!;
  },

  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, `${id}`)
    );
    return response.data!;
  },

  async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    const response = await api.post<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, ''),
      resourceData
    );
    return response.data!;
  },

  async updateResource(id: string, resourceData: Partial<UpdateResourceRequest>): Promise<Resource> {
    const response = await api.patch<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, `${id}`),
      resourceData
    );
    return response.data!;
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(buildServiceUrl(RESOURCES_SERVICE, `${id}`));
  },

  async toggleResourceStatus(id: string): Promise<Resource> {
    const response = await api.patch<Resource>(
      buildServiceUrl(RESOURCES_SERVICE, `${id}/toggle-status`)
    );
    return response.data!;
  },

  // Categories
  async getCategories(type?: string): Promise<Category[]> {
    const url = type 
      ? `${buildServiceUrl(RESOURCES_SERVICE, 'categories')}?type=${type}`
      : buildServiceUrl(RESOURCES_SERVICE, 'categories');
    
    const response = await api.get<Category[]>(url);
    return response.data!;
  },

  async getResourceCategories(): Promise<Category[]> {
    return this.getCategories('RESOURCE_TYPE');
  },

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>(
      buildServiceUrl(RESOURCES_SERVICE, 'categories'),
      categoryData
    );
    return response.data!;
  },

  // Academic Programs
  async getAcademicPrograms(): Promise<AcademicProgram[]> {
    const response = await api.get<AcademicProgram[]>(
      buildServiceUrl(RESOURCES_SERVICE, 'academic-programs')
    );
    return response.data!;
  },

  // Import/Export
  async importResources(importData: ImportResourcesRequest): Promise<ImportResourcesResponse> {
    const response = await api.post<ImportResourcesResponse>(
      buildServiceUrl(RESOURCES_SERVICE, 'import'),
      importData
    );
    return response.data!;
  },

  async exportResources(filters?: ResourceListRequest): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString 
      ? `${buildServiceUrl(RESOURCES_SERVICE, 'export')}?${queryString}`
      : buildServiceUrl(RESOURCES_SERVICE, 'export');

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
    return response.data!;
  },

  async reportMaintenance(resourceId: string, maintenanceData: Omit<MaintenanceRecord, 'id' | 'resourceId'>): Promise<MaintenanceRecord> {
    const response = await api.post<MaintenanceRecord>(
      buildServiceUrl(RESOURCES_SERVICE, `${resourceId}/maintenance`),
      maintenanceData
    );
    return response.data!;
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
    return response.data!.available;
  },

  // Bulk operations
  async bulkUpdateResources(resourceIds: string[], updates: Partial<UpdateResourceRequest>): Promise<Resource[]> {
    const response = await api.patch<Resource[]>(
      buildServiceUrl(RESOURCES_SERVICE, 'bulk'),
      {
        resourceIds,
        updates,
      }
    );
    return response.data!;
  },

  async bulkDeleteResources(resourceIds: string[]): Promise<void> {
    await api.delete(buildServiceUrl(RESOURCES_SERVICE, 'bulk'), {
      json: { resourceIds },
    });
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
    const response = await api.get(buildServiceUrl(RESOURCES_SERVICE, 'stats'));
    return response.data!;
  },
};

export default resourceService;
