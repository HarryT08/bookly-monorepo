import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material';

export interface SwitchProps extends MuiSwitchProps {
	label?: string;
}

export function Switch({ label, ...props }: SwitchProps) {
	return <MuiSwitch {...props} />;
}

export default Switch;
