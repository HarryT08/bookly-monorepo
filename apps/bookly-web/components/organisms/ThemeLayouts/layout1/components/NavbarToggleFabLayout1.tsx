import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { NavbarToggleFab } from '@components/organisms';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
import { useNavbarContext } from '../../components/navbar/contexts/NavbarContext/useNavbarContext';
import { Layout1ConfigDefaultsType } from '../Layout1Config';

type NavbarToggleFabLayout1Props = {
	className?: string;
};

/**
 * The navbar toggle fab layout 1.
 */
function NavbarToggleFabLayout1(props: NavbarToggleFabLayout1Props) {
	const { className } = props;
	const { toggleMobileNavbar, toggleNavbar } = useNavbarContext();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const settings = useFuseLayoutSettings();
	const config = settings.config as Layout1ConfigDefaultsType;

	return (
		<NavbarToggleFab
			className={className}
			onClick={() => {
				if (isMobile) {
					toggleMobileNavbar();
				} else {
					toggleNavbar();
				}
			}}
			position={config.navbar.position}
		/>
	);
}

export default NavbarToggleFabLayout1;
