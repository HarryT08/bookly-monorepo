import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import en from './navigation-i18n/en';
import es from './navigation-i18n/es';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('es', 'navigation', es);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'example-component',
		title: 'Example',
		translate: 'EXAMPLE',
		type: 'item',
		icon: 'lucide:star',
		url: 'example'
	},
	{
		id: 'resources',
		title: 'Recursos',
		translate: 'RESOURCES',
		type: 'item',
		icon: 'heroicons-outline:collection',
		url: '/resources'
	}
];

export default navigationConfig;
