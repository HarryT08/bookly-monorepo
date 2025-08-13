import { useContext } from 'react';
import { NavigationContext } from '@components/organisms/ThemeLayouts/components/navigation/contexts/NavigationContext';

export function useNavigationContext() {
	const context = useContext(NavigationContext);

	if (context === undefined) {
		throw new Error('useNavigationContext must be used within a NavigationContextProvider');
	}

	return context;
}
