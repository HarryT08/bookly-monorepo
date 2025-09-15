import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Input, Button, Select, Text, Card, LoadingSpinner } from '../../atoms';
import { EmptyState } from '../EmptyState/EmptyState';
import { ResourceCard } from '../../molecules/ResourceCard/ResourceCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import { resourceService } from '@/services/resources';
import type { Resource, ResourceFilters, Category, AcademicProgram } from '@/services/resources';

export interface ResourceGridProps {
  onCreateNew?: () => void;
  onEditResource?: (resource: Resource) => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
  initialFilters?: Partial<ResourceFilters>;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({
  onCreateNew,
  onEditResource,
  showFilters = true,
  showCreateButton = true,
  initialFilters = {}
}) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    category: '',
    type: '',
    program: '',
    status: 'all',
    hideCompleted: false,
    ...initialFilters
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const loadResources = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        categoryId: filters.category || undefined,
        type: filters.type || undefined,
        academicProgramId: filters.program || undefined,
        isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
        isAvailable: filters.status === 'available' ? true : filters.status === 'unavailable' ? false : undefined,
        sortBy: 'updatedAt' as const,
        sortOrder: 'desc' as const
      };

      const result = await resourceService.getResources(params);
      
      setResources(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.total || 0,
        totalPages: result.meta.totalPages || 1
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: t('error'),
        message: error.message || t('resources.loadError'),
        timeout: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [categoriesRes, programsRes] = await Promise.all([
        resourceService.getCategories(),
        resourceService.getAcademicPrograms()
      ]);
      
      setCategories(categoriesRes);
      setPrograms(programsRes);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: t('error'),
        message: error.message || t('resources.filterLoadError'),
        timeout: 5000,
      }));
    }
  };

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadResources();
  }, [filters, pagination.page]);

  const handleFilterChange = (key: keyof ResourceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      program: '',
      status: 'all',
      hideCompleted: false
    });
  };

  const handleEditResource = (resource: Resource) => {
    if (onEditResource) {
      onEditResource(resource);
    }
  };

  const statusOptions = [
    { value: 'all', label: t('resources.status.all') },
    { value: 'active', label: t('resources.status.active') },
    { value: 'inactive', label: t('resources.status.inactive') },
    { value: 'available', label: t('resources.status.available') },
    { value: 'unavailable', label: t('resources.status.unavailable') }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Text variant="h2" className="text-secondary-900 dark:text-secondary-100">
            {t('resources.title')}
          </Text>
          <Text variant="body1" color="secondary" className="mt-1">
            {t('resources.subtitle')}
          </Text>
        </div>
        
        {showCreateButton && (
          <Button 
            onClick={onCreateNew}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('resources.createNew')}
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder={t('resources.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
                leftIcon={
                  <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder={t('resources.filterByCategory')}
            >
              <option value="">{t('resources.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              placeholder={t('resources.filterByProgram')}
            >
              <option value="">{t('resources.allPrograms')}</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </Select>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('actions.clearFilters')}
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner message={t('resources.loading')} size="lg" className="py-12" />
      ) : resources.length === 0 ? (
        <EmptyState
          title={t('resources.empty.title')}
          description={t('resources.empty.description')}
          className="py-12"
          action={showCreateButton && onCreateNew ? {
            label: t('resources.createFirst'),
            onClick: onCreateNew,
            variant: 'primary' as const
          } : undefined}
        />
      ) : (
        <div className="space-y-6">
          {/* Results count */}
          <div className="flex justify-between items-center">
            <Text color="secondary">
              {t('resources.resultsCount', { 
                count: resources.length, 
                total: pagination.total 
              })}
            </Text>
            
            <div className="flex items-center gap-2">
              <Text variant="body2" color="secondary">
                {t('resources.sortBy')}:
              </Text>
              <Select
                value="updatedAt"
                onChange={() => {}}
                size="sm"
              >
                <option value="updatedAt">{t('resources.sortOptions.updatedAt')}</option>
                <option value="name">{t('resources.sortOptions.name')}</option>
                <option value="type">{t('resources.sortOptions.type')}</option>
                <option value="capacity">{t('resources.sortOptions.capacity')}</option>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={handleEditResource}
                showActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                {t('pagination.previous')}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={pagination.page === pageNumber ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                {t('pagination.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceGrid;
