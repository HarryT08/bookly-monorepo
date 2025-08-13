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
	processing: string;
	loading: string;
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
	room: string;
	laboratory: string;
	auditorium: string;
	equipment: string;
	resourceLoadFailed: string;
	resourceMessagesDeleted: string;
	resourceMessagesDisabled: string;
	resourceMessagesDeleteFailed: string;
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
		resourceEdit: t('RESOURCE_EDIT', { defaultValue: 'RESOURCE_EDIT' }),
		resourceDelete: t('RESOURCE_DELETE', { defaultValue: 'RESOURCE_DELETE' }),
		resourceDisable: t('RESOURCE_DISABLE', {
			defaultValue: 'RESOURCE_DISABLE'
		}),
		processing: t('PROCESSING', { defaultValue: 'PROCESSING' }),
		loading: t('LOADING', { defaultValue: 'LOADING' }),
		name: t('NAME', { defaultValue: 'NAME' }),
		code: t('CODE', { defaultValue: 'CODE' }),
		type: t('TYPE', { defaultValue: 'TYPE' }),
		status: t('STATUS', { defaultValue: 'STATUS' }),
		capacity: t('CAPACITY', { defaultValue: 'CAPACITY' }),
		location: t('LOCATION', { defaultValue: 'LOCATION' }),
		active: t('ACTIVE', { defaultValue: 'ACTIVE' }),
		category: t('CATEGORY', { defaultValue: 'CATEGORY' }),
		description: t('DESCRIPTION', { defaultValue: 'DESCRIPTION' }),
		locationExample: t('LOCATION_EXAMPLE', {
			defaultValue: 'LOCATION_EXAMPLE'
		}),
		room: t('ROOM', { defaultValue: 'ROOM' }),
		laboratory: t('LABORATORY', { defaultValue: 'LABORATORY' }),
		auditorium: t('AUDITORIUM', { defaultValue: 'AUDITORIUM' }),
		equipment: t('EQUIPMENT', { defaultValue: 'EQUIPMENT' }),
		resourceLoadFailed: t('RESOURCE_LOAD_FAILED', {
			defaultValue: 'RESOURCE_LOAD_FAILED'
		}),
		resourceMessagesDeleted: t('RESOURCE_MESSAGES_DELETED', {
			defaultValue: 'RESOURCE_MESSAGES_DELETED'
		}),
		resourceMessagesDisabled: t('RESOURCE_MESSAGES_DISABLED', {
			defaultValue: 'RESOURCE_MESSAGES_DISABLED'
		}),
		resourceMessagesDeleteFailed: t('RESOURCE_MESSAGES_DELETE_FAILED', {
			defaultValue: 'RESOURCE_MESSAGES_DELETE_FAILED'
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
		})
	};
}
