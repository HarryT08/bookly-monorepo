import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Card, Button, Text, Badge } from '../../atoms';
import type { Resource } from '@/services/resources';

export interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const getStatusColor = (resource: Resource) => {
  if (!resource.isActive) return 'secondary';
  if (!resource.isAvailable) return 'warning';
  return 'success';
};

const getStatusText = (resource: Resource, t: any) => {
  if (!resource.isActive) return t('resources.status.inactive');
  if (!resource.isAvailable) return t('resources.status.unavailable');
  return t('resources.status.available');
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  variant = 'default'
}) => {
  const { t } = useTranslation('common');

  const statusColor = getStatusColor(resource);
  const statusText = getStatusText(resource, t);

  return (
    <Card 
      variant="outlined" 
      className="h-full flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600"
    >
      {/* Header with status badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 truncate text-lg">
            {resource.name}
          </h3>
          <Text variant="body2" color="secondary" className="mt-1">
            {resource.type} • {t('resources.capacity')}: {resource.capacity}
          </Text>
        </div>
        <Badge 
          variant={statusColor} 
          size="sm"
          className="ml-2 flex-shrink-0"
        >
          {statusText}
        </Badge>
      </div>

      {/* Description */}
      {resource.description && (
        <Text 
          variant="body2" 
          color="secondary" 
          className="mb-4 line-clamp-2"
        >
          {resource.description}
        </Text>
      )}

      {/* Location */}
      {resource.location && (
        <div className="flex items-center mb-3">
          <svg className="w-4 h-4 text-secondary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <Text variant="body2" color="secondary" className="truncate">
            {resource.location}
          </Text>
        </div>
      )}

      {/* Categories */}
      {resource.categories && resource.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.categories.slice(0, 3).map((category) => (
            <Badge 
              key={category.id} 
              variant="outline" 
              size="xs"
              style={{ backgroundColor: category.color ? `${category.color}20` : undefined }}
            >
              {category.name}
            </Badge>
          ))}
          {resource.categories.length > 3 && (
            <Badge variant="outline" size="xs">
              +{resource.categories.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Equipment/Features */}
      {resource.attributes?.equipment && resource.attributes.equipment.length > 0 && (
        <div className="mb-4">
          <Text variant="body2" className="font-medium mb-2">
            {t('resources.equipment')}:
          </Text>
          <div className="flex flex-wrap gap-1">
            {resource.attributes.equipment.slice(0, 2).map((equipment, index) => (
              <Badge key={index} variant="secondary" size="xs">
                {equipment}
              </Badge>
            ))}
            {resource.attributes.equipment.length > 2 && (
              <Badge variant="secondary" size="xs">
                +{resource.attributes.equipment.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Actions footer */}
      <div className="mt-auto pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between">
          <Text variant="body2" color="secondary">
            {t('resources.updatedAt')}: {new Date(resource.updatedAt).toLocaleDateString()}
          </Text>
          
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <Link href={`/resources/${resource.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3"
                  >
                    {t('actions.view')}
                  </Button>
                </Link>
              )}
              
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(resource)}
                  className="h-8 px-3"
                >
                  {t('actions.edit')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;
