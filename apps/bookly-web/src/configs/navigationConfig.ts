import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
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
