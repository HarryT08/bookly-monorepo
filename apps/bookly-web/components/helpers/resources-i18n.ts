import type { TFunction } from 'i18next';

export interface ResourceI18n {
	editLabel: string;
	editAria: string;
	deleteLabel: string;
	deleteAria: string;
	disableLabel: string;
	disableAria: string;
	resource: string;
	resourceCreate: string;
	resourceDetails: string;
	resourceEdit: string;
	resourceDelete: string;
	resourceDisable: string;
	resourceNotFound: string;
	name: string;
	code: string;
	type: string;
	status: string;
	capacity: string;
	location: string;
	active: string;
	category: string;
	description: string;
	locationExample: string;
	classroom: string;
	auditorium: string;
	laboratory: string;
	office: string;
	equipment: string;
	vehicle: string;
	other: string;
	locationDescription: string;
	locationDescriptionExample: string;
	available: string;
	occupied: string;
	maintenance: string;
	outOfService: string;
	reserved: string;
	categoryExample: string;
	academicProgram: string;
	academicProgramExample: string;
	cancel: string;
	saving: string;
	createResource: string;
	updateResource: string;
	editResource: string;
	descriptionExample: string;
	resourceLoadFailed: string;
	resourceMessagesCreated: string;
	resourceMessagesCreateFailed: string;
	resourceMessagesUpdated: string;
	resourceMessagesUpdateFailed: string;
	resourceMessagesDeleted: string;
	resourceMessagesDeleteFailed: string;
	resourceMessagesDisabled: string;
	resourceMessagesDisableFailed: string;
	dialogsDeleteTitle: string;
	dialogsDeleteDescription: string;
	dialogsDeleteConfirm: string;
	dialogsDeleteCancel: string;
	dialogsDisableTitle: string;
	dialogsDisableDescription: string;
	dialogsDisableConfirm: string;
	dialogsDisableCancel: string;
	actionsDeleteLabel: string;
	actionsDeleteAria: string;
	actionsDisableLabel: string;
	actionsDisableAria: string;
}

export function getResourceI18n(t: TFunction<'resources'>): ResourceI18n {
	return {
		editLabel: t('EDIT', { defaultValue: 'EDIT' }),
		editAria: t('EDIT', { defaultValue: 'EDIT' }),
		deleteLabel: t('DELETE', { defaultValue: 'DELETE' }),
		deleteAria: t('DELETE', { defaultValue: 'DELETE' }),
		disableLabel: t('DISABLE', { defaultValue: 'DISABLE' }),
		disableAria: t('DISABLE', { defaultValue: 'DISABLE' }),
		resource: t('RESOURCE', { defaultValue: 'RESOURCE' }),
		resourceCreate: t('RESOURCE_CREATE', { defaultValue: 'RESOURCE_CREATE' }),
		resourceDetails: t('RESOURCE_DETAILS', {
			defaultValue: 'RESOURCE_DETAILS'
		}),
		resourceNotFound: t('RESOURCE_NOT_FOUND', { defaultValue: 'RESOURCE_NOT_FOUND' }),
		resourceEdit: t('RESOURCE_EDIT', { defaultValue: 'RESOURCE_EDIT' }),
		resourceDelete: t('RESOURCE_DELETE', { defaultValue: 'RESOURCE_DELETE' }),
		resourceDisable: t('RESOURCE_DISABLE', {
			defaultValue: 'RESOURCE_DISABLE'
		}),
		name: t('NAME', { defaultValue: 'NAME' }),
		code: t('CODE', { defaultValue: 'CODE' }),
		type: t('TYPE', { defaultValue: 'TYPE' }),
		status: t('STATUS', { defaultValue: 'STATUS' }),
		capacity: t('CAPACITY', { defaultValue: 'CAPACITY' }),
		location: t('LOCATION', { defaultValue: 'LOCATION' }),
		active: t('ACTIVE', { defaultValue: 'ACTIVE' }),
		category: t('CATEGORY', { defaultValue: 'CATEGORY' }),
		description: t('DESCRIPTION', { defaultValue: 'DESCRIPTION' }),
		classroom: t('CLASSROOM', { defaultValue: 'CLASSROOM' }),
		laboratory: t('LABORATORY', { defaultValue: 'LABORATORY' }),
		auditorium: t('AUDITORIUM', { defaultValue: 'AUDITORIUM' }),
		equipment: t('EQUIPMENT', { defaultValue: 'EQUIPMENT' }),
		// Location fields
		locationExample: t('LOCATION_EXAMPLE', { defaultValue: 'e.g., Piso 2' }),
		locationDescription: t('LOCATION_DESCRIPTION', { defaultValue: 'LOCATION_DESCRIPTION' }),
		locationDescriptionExample: t('LOCATION_DESCRIPTION_EXAMPLE', {
			defaultValue: 'e.g., Cerca del laboratorio de química'
		}),
		// Category and program fields
		categoryExample: t('CATEGORY_EXAMPLE', { defaultValue: 'e.g., Salón, Laboratorio' }),
		academicProgram: t('ACADEMIC_PROGRAM', { defaultValue: 'ACADEMIC_PROGRAM' }),
		academicProgramExample: t('ACADEMIC_PROGRAM_EXAMPLE', { defaultValue: 'e.g., Ingeniería de Sistemas' }),
		// Description field
		descriptionExample: t('DESCRIPTION_EXAMPLE', {
			defaultValue: 'e.g., Sala equipada con proyector y aire acondicionado'
		}),
		resourceLoadFailed: t('RESOURCE_LOAD_FAILED', {
			defaultValue: 'RESOURCE_LOAD_FAILED'
		}),
		resourceMessagesCreated: t('RESOURCE_MESSAGES_CREATED', {
			defaultValue: 'RESOURCE_MESSAGES_CREATED'
		}),
		resourceMessagesCreateFailed: t('RESOURCE_MESSAGES_CREATE_FAILED', {
			defaultValue: 'RESOURCE_MESSAGES_CREATE_FAILED'
		}),
		resourceMessagesUpdated: t('RESOURCE_MESSAGES_UPDATED', {
			defaultValue: 'RESOURCE_MESSAGES_UPDATED'
		}),
		resourceMessagesUpdateFailed: t('RESOURCE_MESSAGES_UPDATE_FAILED', {
			defaultValue: 'RESOURCE_MESSAGES_UPDATE_FAILED'
		}),
		resourceMessagesDeleted: t('RESOURCE_MESSAGES_DELETED', {
			defaultValue: 'RESOURCE_MESSAGES_DELETED'
		}),
		resourceMessagesDeleteFailed: t('RESOURCE_MESSAGES_DELETE_FAILED', {
			defaultValue: 'RESOURCE_MESSAGES_DELETE_FAILED'
		}),
		resourceMessagesDisabled: t('RESOURCE_MESSAGES_DISABLED', {
			defaultValue: 'RESOURCE_MESSAGES_DISABLED'
		}),
		resourceMessagesDisableFailed: t('RESOURCE_MESSAGES_DISABLE_FAILED', {
			defaultValue: 'RESOURCE_MESSAGES_DISABLE_FAILED'
		}),
		dialogsDeleteTitle: t('DIALOGS_DELETE_TITLE', {
			defaultValue: 'DIALOGS_DELETE_TITLE'
		}),
		dialogsDeleteDescription: t('DIALOGS_DELETE_DESCRIPTION', {
			defaultValue: 'DIALOGS_DELETE_DESCRIPTION'
		}),
		dialogsDeleteConfirm: t('DIALOGS_DELETE_CONFIRM', {
			defaultValue: 'DIALOGS_DELETE_CONFIRM'
		}),
		dialogsDeleteCancel: t('DIALOGS_DELETE_CANCEL', {
			defaultValue: 'DIALOGS_DELETE_CANCEL'
		}),
		dialogsDisableTitle: t('DIALOGS_DISABLE_TITLE', {
			defaultValue: 'DIALOGS_DISABLE_TITLE'
		}),
		dialogsDisableDescription: t('DIALOGS_DISABLE_DESCRIPTION', {
			defaultValue: 'DIALOGS_DISABLE_DESCRIPTION'
		}),
		dialogsDisableConfirm: t('DIALOGS_DISABLE_CONFIRM', {
			defaultValue: 'DIALOGS_DISABLE_CONFIRM'
		}),
		dialogsDisableCancel: t('DIALOGS_DISABLE_CANCEL', {
			defaultValue: 'DIALOGS_DISABLE_CANCEL'
		}),
		actionsDeleteLabel: t('ACTIONS_DELETE_LABEL', {
			defaultValue: 'ACTIONS_DELETE_LABEL'
		}),
		actionsDeleteAria: t('ACTIONS_DELETE_ARIA', {
			defaultValue: 'ACTIONS_DELETE_ARIA'
		}),
		actionsDisableLabel: t('ACTIONS_DISABLE_LABEL', {
			defaultValue: 'ACTIONS_DISABLE_LABEL'
		}),
		actionsDisableAria: t('ACTIONS_DISABLE_ARIA', {
			defaultValue: 'ACTIONS_DISABLE_ARIA'
		}),
		office: t('OFFICE', { defaultValue: 'OFFICE' }),
		vehicle: t('VEHICLE', { defaultValue: 'VEHICLE' }),
		other: t('OTHER', { defaultValue: 'OTHER' }),
		available: t('AVAILABLE', { defaultValue: 'AVAILABLE' }),
		occupied: t('OCCUPIED', { defaultValue: 'OCCUPIED' }),
		maintenance: t('MAINTENANCE', { defaultValue: 'MAINTENANCE' }),
		outOfService: t('OUT_OF_SERVICE', { defaultValue: 'OUT_OF_SERVICE' }),
		reserved: t('RESERVED', { defaultValue: 'RESERVED' }),
		cancel: t('CANCEL', { defaultValue: 'CANCEL' }),
		saving: t('SAVING', { defaultValue: 'SAVING' }),
		createResource: t('CREATE_RESOURCE', { defaultValue: 'CREATE_RESOURCE' }),
		updateResource: t('UPDATE_RESOURCE', { defaultValue: 'UPDATE_RESOURCE' }),
		editResource: t('EDIT_RESOURCE', { defaultValue: 'EDIT_RESOURCE' })
	};
}
