import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { ReactElement } from 'react';
import { SvgIconProps } from '@mui/material';

export interface ActionMenuItem {
	label: string;
	onClick: () => void;
	icon?: ReactElement<SvgIconProps>;
	disabled?: boolean;
	color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface ActionMenuProps {
	actions: ActionMenuItem[];
	tooltip?: string;
	size?: 'small' | 'medium' | 'large';
	iconComponent?: ReactElement<SvgIconProps>;
}

export function ActionMenu({
	actions,
	tooltip = 'Más opciones',
	size = 'small',
	iconComponent = <MoreVertIcon />
}: ActionMenuProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleAction = (action: ActionMenuItem) => {
		action.onClick();
		handleClose();
	};

	return (
		<>
			<Tooltip title={tooltip}>
				<IconButton
					onClick={handleClick}
					size={size}
					aria-controls={open ? 'action-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
				>
					{iconComponent}
				</IconButton>
			</Tooltip>
			<Menu
				id="action-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'action-button'
				}}
			>
				{actions.map((action, index) => (
					<MenuItem
						key={index}
						onClick={() => handleAction(action)}
						disabled={action.disabled}
						sx={{ color: action.color !== 'inherit' ? `${action.color}.main` : undefined }}
					>
						{action.icon && <ListItemIcon sx={{ color: 'inherit' }}>{action.icon}</ListItemIcon>}
						<ListItemText>{action.label}</ListItemText>
					</MenuItem>
				))}
			</Menu>
		</>
	);
}

export default ActionMenu;
