import AuthGuardRedirect from '@auth/AuthGuardRedirect';
import { MainLayout } from '@components/templates';
import React from 'react';

interface LayoutProps {
	children: React.ReactNode;
}

function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<AuthGuardRedirect auth={['admin']}>
			<MainLayout>{children}</MainLayout>
		</AuthGuardRedirect>
	);
}

export default Layout;
