import type { TFunction } from 'i18next';

export interface ResourceActionI18n {
	editLabel: string;
	editAria: string;
	deleteLabel: string;
	deleteAria: string;
	disableLabel: string;
	disableAria: string;
}

export function getResourceActionI18n(t: TFunction): ResourceActionI18n {
	return {
		editLabel: t('EDIT', { defaultValue: 'EDIT' }),
		editAria: t('EDIT', { defaultValue: 'EDIT' }),
		deleteLabel: t('DELETE', { defaultValue: 'DELETE' }),
		deleteAria: t('DELETE', { defaultValue: 'DELETE' }),
		disableLabel: t('DISABLE', { defaultValue: 'DISABLE' }),
		disableAria: t('DISABLE', { defaultValue: 'DISABLE' })
	};
}
