import { lazy, memo, Suspense } from 'react';

const QuickPanel = lazy(() => import('@components/organisms/ThemeLayouts/components/quickPanel/QuickPanel'));

/**
 * The right side layout 3.
 */
function RightSideLayout3() {
	return (
		<Suspense>
			<QuickPanel />
		</Suspense>
	);
}

export default memo(RightSideLayout3);
