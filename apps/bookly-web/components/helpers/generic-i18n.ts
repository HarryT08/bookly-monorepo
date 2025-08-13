import type { TFunction } from 'i18next';

export interface GenericI18n {
	backToList: string;
	save: string;
	saving: string;
	processing: string;
	loading: string;
	edit: string;
	delete: string;
	disable: string;
	cancel: string;
	confirm: string;
}

export function getGenericI18n(t: TFunction<'resources'>): GenericI18n {
	return {
		backToList: t('BACK_TO_LIST', { defaultValue: 'BACK_TO_LIST' }),
		save: t('SAVE', { defaultValue: 'SAVE' }),
		saving: t('SAVING', { defaultValue: 'SAVING' }),
		processing: t('PROCESSING', { defaultValue: 'PROCESSING' }),
		loading: t('LOADING', { defaultValue: 'LOADING' }),
		edit: t('EDIT', { defaultValue: 'EDIT' }),
		delete: t('DELETE', { defaultValue: 'DELETE' }),
		disable: t('DISABLE', { defaultValue: 'DISABLE' }),
		cancel: t('CANCEL', { defaultValue: 'CANCEL' }),
		confirm: t('CONFIRM', { defaultValue: 'CONFIRM' })
	};
}
