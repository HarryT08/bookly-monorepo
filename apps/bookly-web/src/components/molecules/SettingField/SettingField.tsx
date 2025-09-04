import { Box, Typography } from '@mui/material';
import { TextField } from '../../atoms/TextField';
import { Switch } from '../../atoms';

interface BaseSettingFieldProps {
	label: string;
	description?: string;
	fullWidth?: boolean;
}

interface TextFieldProps extends BaseSettingFieldProps {
	type: 'text' | 'number' | 'textarea';
	value: string | number;
	onChange: (value: string | number) => void;
	multiline?: boolean;
	rows?: number;
}

interface SwitchFieldProps extends BaseSettingFieldProps {
	type: 'switch';
	checked: boolean;
	onChange: (checked: boolean) => void;
}

type SettingFieldProps = TextFieldProps | SwitchFieldProps;

export function SettingField(props: SettingFieldProps) {
	const { label, description, fullWidth = true } = props;

	const renderField = () => {
		switch (props.type) {
			case 'text':
			case 'number':
				return (
					<TextField
						fullWidth={fullWidth}
						label={label}
						type={props.type}
						value={props.value}
						onChange={(e) =>
							props.onChange(props.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)
						}
					/>
				);

			case 'textarea':
				return (
					<TextField
						fullWidth={fullWidth}
						label={label}
						multiline
						rows={props.rows || 3}
						value={props.value}
						onChange={(e) => props.onChange(e.target.value)}
					/>
				);

			case 'switch':
				return (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Box>
							<Typography variant="body1">{label}</Typography>
							{description && (
								<Typography
									variant="body2"
									color="text.secondary"
								>
									{description}
								</Typography>
							)}
						</Box>
						<Switch
							checked={props.checked}
							onChange={(e) => props.onChange(e.target.checked)}
						/>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Box mb={2}>
			{renderField()}
			{props.type !== 'switch' && description && (
				<Typography
					variant="caption"
					color="text.secondary"
					mt={1}
				>
					{description}
				</Typography>
			)}
		</Box>
	);
}

export default SettingField;
