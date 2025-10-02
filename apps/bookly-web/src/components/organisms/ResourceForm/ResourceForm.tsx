import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  Button, 
  Input, 
  Select, 
  Text, 
  Card, 
  Badge,
  Checkbox
} from '../../atoms';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import { resourceService } from '@/services/resources';
import type { 
  Resource, 
  CreateResourceRequest, 
  UpdateResourceRequest,
  Category,
  AcademicProgram,
  ResourceAttributes 
} from '@/services/resources';

export interface ResourceFormProps {
  resource?: Resource;
  onSubmit?: (resource: Resource) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

interface FormData extends Omit<CreateResourceRequest, 'attributes'> {
  attributes: {
    equipment: string[];
    accessibility: string[];
    specialConditions: string[];
    technicalSpecs: Record<string, string>;
  };
}

type TabType = 'basic' | 'attributes' | 'availability' | 'categories';

const EQUIPMENT_OPTIONS = [
  'Proyector', 'Computador', 'Audio', 'Pizarra Digital', 'Aire Acondicionado',
  'WiFi', 'Micrófono', 'Cámaras', 'Sistema de Video', 'Tablero'
];

const ACCESSIBILITY_OPTIONS = [
  'Acceso para sillas de ruedas', 'Baño adaptado', 'Señalización braille',
  'Amplificación auditiva', 'Iluminación especial', 'Rampas de acceso'
];

const SPECIAL_CONDITIONS = [
  'Silencioso', 'Ventilado', 'Oscurecible', 'Gran capacidad',
  'Equipo especializado', 'Seguridad reforzada'
];

export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  onSubmit,
  onCancel,
  mode = 'create'
}) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      type: '',
      capacity: 0,
      location: '',
      academicProgramId: '',
      categoryIds: [],
      attributes: {
        equipment: [],
        accessibility: [],
        specialConditions: [],
        technicalSpecs: {}
      },
      availability: []
    }
  });

  const watchedEquipment = watch('attributes.equipment') || [];
  const watchedAccessibility = watch('attributes.accessibility') || [];
  const watchedSpecialConditions = watch('attributes.specialConditions') || [];

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, programsRes] = await Promise.all([
        resourceService.getCategories(),
        resourceService.getAcademicPrograms()
      ]);
      
      setCategories(categoriesRes);
      setPrograms(programsRes);

      // Load existing resource data if editing
      if (resource && mode === 'edit') {
        reset({
          name: resource.name,
          description: resource.description || '',
          type: resource.type,
          capacity: resource.capacity,
          location: resource.location || '',
          academicProgramId: resource.academicProgramId || '',
          categoryIds: resource.categories.map(c => c.id),
          attributes: {
            equipment: resource.attributes?.equipment || [],
            accessibility: resource.attributes?.accessibility || [],
            specialConditions: resource.attributes?.specialConditions || [],
            technicalSpecs: resource.attributes?.technicalSpecs || {}
          },
          availability: []
        });
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: t('error'),
        message: error.message || t('resources.form.loadError'),
        timeout: 5000,
      }));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [resource, mode]);

  const onFormSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const resourceData = {
        ...data,
        attributes: {
          equipment: data.attributes.equipment,
          accessibility: data.attributes.accessibility,
          specialConditions: data.attributes.specialConditions,
          technicalSpecs: data.attributes.technicalSpecs
        }
      };

      let result: Resource;

      if (mode === 'edit' && resource) {
        result = await resourceService.updateResource(resource.id, resourceData);
        dispatch(addNotification({
          type: 'success',
          title: t('success'),
          message: t('resources.form.updateSuccess'),
          timeout: 3000,
        }));
      } else {
        result = await resourceService.createResource(resourceData);
        dispatch(addNotification({
          type: 'success',
          title: t('success'),
          message: t('resources.form.createSuccess'),
          timeout: 3000,
        }));
      }

      if (onSubmit) {
        onSubmit(result);
      } else {
        router.push('/resources');
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: t('error'),
        message: error.message || t('resources.form.submitError'),
        timeout: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    const current = getValues('attributes.equipment') || [];
    if (checked) {
      setValue('attributes.equipment', [...current, equipment]);
    } else {
      setValue('attributes.equipment', current.filter(e => e !== equipment));
    }
  };

  const handleAccessibilityChange = (accessibility: string, checked: boolean) => {
    const current = getValues('attributes.accessibility') || [];
    if (checked) {
      setValue('attributes.accessibility', [...current, accessibility]);
    } else {
      setValue('attributes.accessibility', current.filter(a => a !== accessibility));
    }
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const current = getValues('attributes.specialConditions') || [];
    if (checked) {
      setValue('attributes.specialConditions', [...current, condition]);
    } else {
      setValue('attributes.specialConditions', current.filter(c => c !== condition));
    }
  };

  const tabs = [
    { id: 'basic' as TabType, label: t('resources.form.tabs.basicInfo'), icon: '📋' },
    { id: 'attributes' as TabType, label: t('resources.form.tabs.attributes'), icon: '⚙️' },
    { id: 'categories' as TabType, label: t('resources.form.tabs.categories'), icon: '🏷️' },
    { id: 'availability' as TabType, label: t('resources.form.tabs.availability'), icon: '📅' }
  ];

  if (loadingData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-200 rounded"></div>
            <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Text variant="h1" className="text-secondary-900 dark:text-secondary-100">
          {mode === 'edit' ? t('resources.form.editTitle') : t('resources.form.createTitle')}
        </Text>
        <Text variant="body1" color="secondary" className="mt-2">
          {mode === 'edit' ? t('resources.form.editSubtitle') : t('resources.form.createSubtitle')}
        </Text>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <Card className="p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <Card className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <Text variant="h3" className="text-secondary-900 dark:text-secondary-100 mb-4">
                {t('resources.form.tabs.basicInfo')}
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label={t('resources.form.name') + ' *'}
                    placeholder={t('resources.form.namePlaceholder')}
                    error={errors.name?.message}
                    {...register('name', {
                      required: t('validation.required'),
                      minLength: { value: 3, message: t('validation.minLength', { count: 3 }) }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    {t('resources.form.description')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('resources.form.descriptionPlaceholder')}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-100"
                    {...register('description')}
                  />
                </div>

                <div>
                  <Select
                    label={t('resources.form.type') + ' *'}
                    error={errors.type?.message}
                    {...register('type', { required: t('validation.required') })}
                  >
                    <option value="">{t('resources.form.selectType')}</option>
                    <option value="Salón">{t('resources.types.classroom')}</option>
                    <option value="Laboratorio">{t('resources.types.laboratory')}</option>
                    <option value="Auditorio">{t('resources.types.auditorium')}</option>
                    <option value="Equipo Multimedia">{t('resources.types.multimedia')}</option>
                    <option value="Oficina">{t('resources.types.office')}</option>
                  </Select>
                </div>

                <Input
                  label={t('resources.form.capacity') + ' *'}
                  type="number"
                  min="1"
                  placeholder="30"
                  error={errors.capacity?.message}
                  {...register('capacity', {
                    required: t('validation.required'),
                    min: { value: 1, message: t('validation.min', { count: 1 }) }
                  })}
                />

                <Input
                  label={t('resources.form.location')}
                  placeholder={t('resources.form.locationPlaceholder')}
                  {...register('location')}
                />

                <div>
                  <Select
                    label={t('resources.form.academicProgram')}
                    {...register('academicProgramId')}
                  >
                    <option value="">{t('resources.form.selectProgram')}</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="space-y-8">
              <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                {t('resources.form.tabs.attributes')}
              </Text>

              {/* Equipment */}
              <div>
                <Text variant="h4" className="text-secondary-800 dark:text-secondary-200 mb-4">
                  {t('resources.form.equipment')}
                </Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <Checkbox
                      key={equipment}
                      label={equipment}
                      checked={watchedEquipment.includes(equipment)}
                      onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    />
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <Text variant="h4" className="text-secondary-800 dark:text-secondary-200 mb-4">
                  {t('resources.form.accessibility')}
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ACCESSIBILITY_OPTIONS.map((accessibility) => (
                    <Checkbox
                      key={accessibility}
                      label={accessibility}
                      checked={watchedAccessibility.includes(accessibility)}
                      onChange={(e) => handleAccessibilityChange(accessibility, e.target.checked)}
                    />
                  ))}
                </div>
              </div>

              {/* Special Conditions */}
              <div>
                <Text variant="h4" className="text-secondary-800 dark:text-secondary-200 mb-4">
                  {t('resources.form.specialConditions')}
                </Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIAL_CONDITIONS.map((condition) => (
                    <Checkbox
                      key={condition}
                      label={condition}
                      checked={watchedSpecialConditions.includes(condition)}
                      onChange={(e) => handleConditionChange(condition, e.target.checked)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                {t('resources.form.tabs.categories')}
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <Checkbox
                      label={category.name}
                      checked={watch('categoryIds')?.includes(category.id) || false}
                      onChange={(e) => {
                        const current = getValues('categoryIds') || [];
                        if (e.target.checked) {
                          setValue('categoryIds', [...current, category.id]);
                        } else {
                          setValue('categoryIds', current.filter(id => id !== category.id));
                        }
                      }}
                    />
                    {category.description && (
                      <Text variant="body2" color="secondary" className="mt-2">
                        {category.description}
                      </Text>
                    )}
                    {category.color && (
                      <Badge
                        variant="outline"
                        size="xs"
                        style={{ backgroundColor: `${category.color}20` }}
                        className="mt-2"
                      >
                        {category.code}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                {t('resources.form.tabs.availability')}
              </Text>
              
              <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg">
                <Text variant="body2" color="secondary">
                  {t('resources.form.availabilityNote')}
                </Text>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={loading}
          >
            {t('actions.cancel')}
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading}
          >
            {mode === 'edit' ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
