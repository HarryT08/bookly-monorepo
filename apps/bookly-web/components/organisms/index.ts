export { AuditDetailsDialog } from './AuditDetailsDialog';
export type { AuditDetailsDialogProps } from './AuditDetailsDialog';
export { CalendarView } from './calendar';
export { CancelReservationDialog } from './CancelReservationDialog';
export { CategoryDialog } from './CategoryDialog';
export type { CategoryDialogData, Category } from './CategoryDialog';
export { CreateProgramDialog } from './CreateProgramDialog';
export type { CreateProgramDialogData } from './CreateProgramDialog';
export { DataTable } from './DataTable';
export type { DataTableColumn, DataTableProps } from './DataTable';
export { PageHeader } from './PageHeader';

export { StatsGrid } from './StatsGrid';
export type { PageHeaderProps } from './PageHeader';
export { UserRoleDialog } from './UserRoleDialog';
export { RoleDialog } from './RoleDialog';
export type { RoleDialogData, RoleDialogProps, Permission } from './RoleDialog';

// Settings sections - export from actual files
export { default as GeneralSettings } from './GeneralSettingsSection/GeneralSettingsSection';
export { default as SecuritySettings } from './SecuritySettingsSection/SecuritySettingsSection';
export { default as NotificationSettings } from './NotificationSettingsSection/NotificationSettingsSection';
export { default as ReservationSettings } from './ReservationSettingsSection/ReservationSettingsSection';
export { default as SystemSettings } from './SystemSettingsSection/SystemSettingsSection';
export { default as SystemActions } from './SystemActionsSection/SystemActionsSection';
export { SettingsCard } from './SettingsCard';

// Export with full names for compatibility
export { default as GeneralSettingsSection } from './GeneralSettingsSection/GeneralSettingsSection';
export { default as SecuritySettingsSection } from './SecuritySettingsSection/SecuritySettingsSection';
export { default as NotificationSettingsSection } from './NotificationSettingsSection/NotificationSettingsSection';
export { default as ReservationSettingsSection } from './ReservationSettingsSection/ReservationSettingsSection';
export { default as SystemSettingsSection } from './SystemSettingsSection/SystemSettingsSection';
export { default as SystemActionsSection } from './SystemActionsSection/SystemActionsSection';

// Theme exports
export { default as themeLayouts } from './ThemeLayouts/themeLayouts';
export type { themeLayoutsType } from './ThemeLayouts/themeLayouts';
export { default as themeLayoutConfigs } from './ThemeLayouts/themeLayoutConfigs';

// Theme Layout Components
export { default as UserMenu } from './ThemeLayouts/components/UserMenu';
export { default as Logo } from './ThemeLayouts/components/Logo';
export { default as Navigation } from './ThemeLayouts/components/navigation/Navigation';
export { default as NavigationSearch } from './ThemeLayouts/components/navigation/NavigationSearch';
export { default as NavigationShortcuts } from './ThemeLayouts/components/navigation/NavigationShortcuts';
export { default as LanguageSwitcher } from './ThemeLayouts/components/LanguageSwitcher';
export { default as AdjustFontSize } from './ThemeLayouts/components/AdjustFontSize';
export { default as FullScreenToggle } from './ThemeLayouts/components/FullScreenToggle';
export { default as GoToDocBox } from './ThemeLayouts/components/GoToDocBox';
export { default as NavbarToggleButton } from './ThemeLayouts/components/navbar/NavbarToggleButton';
export { default as NavbarToggleFab } from './ThemeLayouts/components/navbar/NavbarToggleFab';
export { default as QuickPanelToggleButton } from './ThemeLayouts/components/quickPanel/QuickPanelToggleButton';

// Configurator Components
export { default as SettingsPanel } from './ThemeLayouts/components/configurator/SettingsPanel';
export { default as ThemesPanel } from './ThemeLayouts/components/configurator/ThemesPanel';

// Theme Layout Hooks
export { default as useNavigationItems } from './ThemeLayouts/components/navigation/hooks/useNavigationItems';
export { useNavbarContext } from './ThemeLayouts/components/navbar/contexts/NavbarContext/useNavbarContext';

// TipTap UI exports
export type { ButtonProps } from './TipTap/tiptap-ui-primitive/button';
export {
	HeadingButton,
	getFormattedHeadingName,
	headingIcons,
	type Level
} from './TipTap/tiptap-ui/heading-button/heading-button';
