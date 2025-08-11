import { z } from 'zod';
import type {
	CreateResourceDto,
	ResourceResponseDto,
	UpdateResourceDto,
	AvailableSchedules,
	WeeklySlot
} from './types';

export interface ValidationIssue {
	path: string;
	message: string;
}

function extractWeeklySlots(input?: AvailableSchedules): WeeklySlot[] {
	const weekly = input?.operatingHours && (input.operatingHours as { weekly?: WeeklySlot[] }).weekly;
	return Array.isArray(weekly) ? weekly : [];
}

// Zod schemas
const hhmm = /^\d{2}:\d{2}$/;

export const weeklySlotSchema = z.object({
	dayOfWeek: z.number().int().min(0).max(7),
	date: z.string().optional(),
	start: z.string().regex(hhmm, 'Formato HH:mm'),
	end: z.string().regex(hhmm, 'Formato HH:mm')
});

export const availableSchedulesSchema = z
	.object({
		operatingHours: z
			.object({
				weekly: z.array(weeklySlotSchema).optional()
			})
			.partial()
			.optional(),
		restrictions: z.array(z.record(z.unknown())).optional(),
		priorities: z.array(z.record(z.unknown())).optional()
	})
	.partial();

const resourceTypeEnum = z.enum(['ROOM', 'EQUIPMENT', 'AUDITORIUM', 'LABORATORY', 'COMPUTER']);
const resourceStatusEnum = z.enum(['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED']);

// Create schema must match CreateResourceDto exactly
export const createResourceSchema = z.object({
	name: z.string().min(1, 'Nombre es requerido'),
	type: resourceTypeEnum,
	location: z
		.object({
			building: z.string().optional(),
			floor: z.string().optional(),
			room: z.string().optional(),
			description: z.string().optional()
		})
		.partial()
		.optional(),
	capacity: z
		.number({ invalid_type_error: 'Capacidad debe ser un entero positivo' })
		.int('Capacidad debe ser un entero positivo')
		.positive('Capacidad debe ser un entero positivo')
		.optional(),
	description: z.string().optional(),
	attributes: z.record(z.unknown()).optional(),
	availableSchedules: availableSchedulesSchema.optional(),
	categoryId: z.string().optional()
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
		status: resourceStatusEnum.optional(),
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
