import { z } from 'zod';

export interface ValidationIssue {
	path: string;
	message: string;
}

// Zod schemas aligned with backend API (Swagger)
const resourceTypeEnum = z.enum(['CLASSROOM', 'AUDITORIUM', 'LABORATORY', 'OFFICE', 'EQUIPMENT', 'VEHICLE', 'OTHER']);
const resourceStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED']);

// Backend uses generic objects for attributes and availabilityRules
const attributesSchema = z.record(z.unknown()).optional();
const availabilityRulesSchema = z.record(z.unknown()).optional();

// Create schema aligned with backend CreateResourceDto
export const createResourceSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	description: z.string().max(500).optional(),
	type: resourceTypeEnum,
	categoryId: z.string().uuid('Category is required'), // Required in backend
	programId: z.string().uuid('Program is required'), // Required in backend
	location: z.string().min(1).optional(), // Backend expects string, not object
	capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
	attributes: attributesSchema,
	availabilityRules: availabilityRulesSchema,
	isActive: z.boolean().optional(),
});

// Update schema aligned with backend UpdateResourceDto
export const updateResourceSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100).optional(),
	description: z.string().max(500).optional(),
	location: z.string().min(1).optional(), // Backend expects string, not object
	capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
	status: resourceStatusEnum.optional(),
	attributes: attributesSchema,
	availabilityRules: availabilityRulesSchema,
	isActive: z.boolean().optional(),
});

// Type inference for forms
export type CreateResourceFormData = z.infer<typeof createResourceSchema>;
export type UpdateResourceFormData = z.infer<typeof updateResourceSchema>;

// Validation helper functions
export function validateCreateResource(data: unknown): { success: true; data: CreateResourceFormData } | { success: false; errors: z.ZodError } {
	const result = createResourceSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: result.error };
}

export function validateUpdateResource(data: unknown): { success: true; data: UpdateResourceFormData } | { success: false; errors: z.ZodError } {
	const result = updateResourceSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: result.error };
}

// Export schemas for form integration
export { resourceTypeEnum, resourceStatusEnum };
