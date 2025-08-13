import { z } from 'zod';
import type {
	CreateResourceDto,
	UpdateResourceDto,
} from './types';

export interface ValidationIssue {
	path: string;
	message: string;
}

// Zod schemas aligned with backend API
const resourceTypeEnum = z.enum(['CLASSROOM', 'AUDITORIUM', 'LABORATORY', 'OFFICE', 'EQUIPMENT', 'VEHICLE', 'OTHER']);
const resourceStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED']);

// Backend uses generic objects for attributes and availabilityRules
const attributesSchema = z.record(z.unknown()).optional();
const availabilityRulesSchema = z.record(z.unknown()).optional();

// Usage Rules Schema
export const usageRulesSchema = z
	.object({
		// Time restrictions
		minReservationTime: z.number().int().min(1, 'Tiempo mínimo debe ser mayor a 0').optional(),
		maxReservationTime: z.number().int().min(1, 'Tiempo máximo debe ser mayor a 0').optional(),
		advanceBookingMin: z.number().int().min(0, 'Anticipación mínima debe ser positiva').optional(),
		advanceBookingMax: z.number().int().min(1, 'Anticipación máxima debe ser mayor a 0').optional(),

		// User restrictions
		userPriorities: z.array(userPriorityEnum).optional(),
		requiredTraining: z.array(z.string().min(1, 'Entrenamiento requerido no puede estar vacío')).optional(),
		maxReservationsPerUser: z.number().int().min(1, 'Máximo de reservas por usuario debe ser mayor a 0').optional(),
		maxReservationsPerWeek: z.number().int().min(1, 'Máximo de reservas por semana debe ser mayor a 0').optional(),

		// Cancellation rules
		cancellationDeadline: z.number().int().min(0, 'Plazo de cancelación debe ser positivo').optional(),
		noShowPenalty: z.boolean().optional(),
		penaltyDuration: z.number().int().min(1, 'Duración de penalización debe ser mayor a 0').optional(),

		// Special conditions
		requiresApproval: z.boolean().optional(),
		allowRecurring: z.boolean().optional(),
		specialRequirements: z.array(z.string().min(1, 'Requerimiento especial no puede estar vacío')).optional()
	})
	.partial();

// Technical Specifications Schema
export const technicalSpecsSchema = z
	.object({
		// General specs
		specifications: z.record(z.string()).optional(),
		associatedEquipment: z.array(z.string().min(1, 'Equipo asociado no puede estar vacío')).optional(),
		softwareInstalled: z.array(z.string().min(1, 'Software no puede estar vacío')).optional(),

		// Maintenance
		maintenanceFrequency: maintenanceFrequencyEnum.optional(),
		maintenanceNotes: z.string().optional(),
		estimatedLifespan: z.number().int().min(1, 'Vida útil debe ser mayor a 0').optional(),

		// Capacity details
		physicalCapacity: z.number().int().min(1, 'Capacidad física debe ser mayor a 0').optional(),
		optimalCapacity: z.number().int().min(1, 'Capacidad óptima debe ser mayor a 0').optional(),
		accessibilityFeatures: z
			.array(z.string().min(1, 'Característica de accesibilidad no puede estar vacía'))
			.optional()
	})
	.partial();

// Cost Configuration Schema
export const costConfigSchema = z
	.object({
		costPerHour: z.number().min(0, 'Costo por hora debe ser positivo').optional(),
		costPerDay: z.number().min(0, 'Costo por día debe ser positivo').optional(),
		costPerReservation: z.number().min(0, 'Costo por reserva debe ser positivo').optional(),

		// Discounts
		studentDiscount: z.number().min(0).max(100, 'Descuento debe estar entre 0 y 100%').optional(),
		facultyDiscount: z.number().min(0).max(100, 'Descuento debe estar entre 0 y 100%').optional(),
		programDiscounts: z.record(z.number().min(0).max(100, 'Descuento debe estar entre 0 y 100%')).optional(),

		// Payment
		paymentMethods: z.array(paymentMethodEnum).optional(),
		requiresDeposit: z.boolean().optional(),
		depositAmount: z.number().min(0, 'Monto de depósito debe ser positivo').optional(),
		refundPolicy: z.string().optional()
	})
	.partial();

// Create schema must match CreateResourceDto exactly
export const createResourceSchema = z.object({
	name: z.string().min(1, 'Nombre es requerido'),
	type: resourceTypeEnum,
	status: resourceStatusEnum.optional(),
	location: z.string().min(1).optional(),
	capacity: z
		.number({ invalid_type_error: 'Capacidad debe ser un entero positivo' })
		.int('Capacidad debe ser un entero positivo')
		.positive('Capacidad debe ser un entero positivo')
		.optional(),
	description: z.string().optional(),
	attributes: z.record(z.unknown()).optional(),
	availableSchedules: availableSchedulesSchema.optional(),
	categoryId: z.string().uuid('ID de categoría debe ser un UUID válido').optional(),
	academicProgramId: z.string().uuid('ID de programa académico debe ser un UUID válido').optional(),
	usageRules: usageRulesSchema.optional(),
	technicalSpecs: technicalSpecsSchema.optional(),
	costConfig: costConfigSchema.optional()
});

export const _createResourceSchemaWithRules = createResourceSchema.superRefine((val, ctx) => {
	const weekly = extractWeeklySlots(val.availableSchedules as unknown as AvailableSchedules);

	if (weekly.length > 0) {
		const issues = validateNoOverlaps(weekly);
		for (const i of issues) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: i.message,
				path: ['availableSchedules']
			});
		}
	}
});

// Update schema matches UpdateResourceDto
export const updateResourceSchema = createResourceSchema
	.partial()
	.extend({
		isActive: z.boolean().optional()
	})
	.superRefine((val, ctx) => {
		const weekly = extractWeeklySlots(val.availableSchedules as unknown as AvailableSchedules);

		if (weekly.length > 0) {
			const issues = validateNoOverlaps(weekly);
			for (const i of issues) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: i.message,
					path: ['availableSchedules']
				});
			}
		}

		// Validate usage rules consistency
		if (val.usageRules) {
			const rules = val.usageRules as UsageRules;

			if (
				rules.minReservationTime &&
				rules.maxReservationTime &&
				rules.minReservationTime > rules.maxReservationTime
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Tiempo mínimo de reserva no puede ser mayor al tiempo máximo',
					path: ['usageRules', 'minReservationTime']
				});
			}

			if (
				rules.advanceBookingMin &&
				rules.advanceBookingMax &&
				rules.advanceBookingMin > rules.advanceBookingMax
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Anticipación mínima no puede ser mayor a la anticipación máxima',
					path: ['usageRules', 'advanceBookingMin']
				});
			}
		}

		// Validate technical specs consistency
		if (val.technicalSpecs) {
			const specs = val.technicalSpecs as TechnicalSpecifications;

			if (specs.physicalCapacity && specs.optimalCapacity && specs.optimalCapacity > specs.physicalCapacity) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Capacidad óptima no puede ser mayor a la capacidad física',
					path: ['technicalSpecs', 'optimalCapacity']
				});
			}
		}
	});

export type CreateResourceFormValues = z.infer<typeof createResourceSchema>;
export type UpdateResourceFormValues = z.infer<typeof updateResourceSchema>;

export interface ValidationResult {
	ok: boolean;
	errors: ValidationIssue[];
}

export function isPositiveInteger(value: unknown): boolean {
	return Number.isInteger(value) && (value as number) > 0;
}

export function validateNoOverlaps(
	schedules?: {
		start: string;
		end: string;
		dayOfWeek?: number;
		date?: string;
	}[]
): ValidationIssue[] {
	if (!schedules || schedules.length === 0) return [];

	const errors: ValidationIssue[] = [];
	// naive O(n log n) overlap check per same key (dayOfWeek or date)
	const groups = new Map<string, { start: number; end: number; raw: { start: string; end: string } }[]>();
	for (const s of schedules) {
		const key = s.date ? `d:${s.date}` : `w:${s.dayOfWeek ?? -1}`;
		const start = Date.parse(`1970-01-01T${s.start}Z`);
		const end = Date.parse(`1970-01-01T${s.end}Z`);

		if (!groups.has(key)) groups.set(key, []);

		groups.get(key)!.push({ start, end, raw: { start: s.start, end: s.end } });
	}
	for (const [gk, arr] of groups) {
		arr.sort((a, b) => a.start - b.start);
		for (let i = 1; i < arr.length; i++) {
			const prev = arr[i - 1];
			const cur = arr[i];

			if (cur.start < prev.end) {
				errors.push({
					path: `availableSchedules(${gk})`,
					message: 'Rangos de tiempo solapados'
				});
			}
		}
	}
	return errors;
}

export function validateCreateResourceDto(dto: CreateResourceDto): ValidationResult {
	const parsed = createResourceSchema.safeParse(dto);

	if (parsed.success) return { ok: true, errors: [] };

	const errors: ValidationIssue[] = parsed.error.issues.map((i) => ({
		path: String(i.path[0] ?? 'root'),
		message: i.message
	}));
	return { ok: false, errors };
}

export function validateUpdateResourceDto(dto: UpdateResourceDto): ValidationResult {
	const parsed = updateResourceSchema.safeParse(dto);

	if (parsed.success) return { ok: true, errors: [] };

	const errors: ValidationIssue[] = parsed.error.issues.map((i) => ({
		path: String(i.path[0] ?? 'root'),
		message: i.message
	}));
	return { ok: false, errors };
}

export type ResourceUpsertResponse = { ok: true; data: ResourceResponseDto } | { ok: false; errors: ValidationIssue[] };
