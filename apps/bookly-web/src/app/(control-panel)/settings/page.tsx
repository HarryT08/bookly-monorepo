'use client';

import { SettingsTemplate } from '../../../components/templates';
import { useSettings } from '../../../hooks/useSettings';

export default function SettingsPage() {
	const { settings, saveMessage, isLoading, handleSettingChange, handleSave, showMessage } = useSettings();

	return (
		<SettingsTemplate
			settings={settings}
			onSettingChange={handleSettingChange}
			onSave={handleSave}
			saveMessage={saveMessage}
			isLoading={isLoading}
			onShowMessage={showMessage}
		/>
	);
}
