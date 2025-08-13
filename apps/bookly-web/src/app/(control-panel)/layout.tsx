import AuthGuardRedirect from '@auth/AuthGuardRedirect';
import { MainLayout } from '@components/templates';

function Layout({ children }) {
	return (
		<AuthGuardRedirect auth={['admin']}>
			<MainLayout>{children}</MainLayout>
		</AuthGuardRedirect>
	);
}

export default Layout;
