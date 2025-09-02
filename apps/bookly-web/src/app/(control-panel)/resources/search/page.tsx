'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Typography,
	Paper,
	Box,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	Alert,
	Card,
	CardContent,
	Stack,
	Skeleton,
	Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

import { useAdvancedSearch } from '../../../../hooks/useAdvancedSearch';
import type { AdvancedSearchFilters } from '../../../../services/availability/types';

export default function AdvancedSearchPage() {
	const { t } = useTranslation('resources');

	// Advanced search filters state
	const [filters, setFilters] = useState<AdvancedSearchFilters>({
		searchTerm: '',
		resourceTypes: [],
		locations: [],
		categories: [],
		capacityMin: undefined,
		capacityMax: undefined,
		features: [],
		academicPrograms: [],
		includeUnavailable: false,
		availabilityWindow: undefined,
		sortBy: 'name',
		sortOrder: 'asc',
		page: 1,
		limit: 10
	});

	const [showFilters, setShowFilters] = useState(false);

	// Advanced search hook
	const { searchResults, loading, performAdvancedSearch, clearResults, error } = useAdvancedSearch();

	// Handle filter changes
	const updateFilter = (
		key: keyof AdvancedSearchFilters,
		value: AdvancedSearchFilters[keyof AdvancedSearchFilters]
	) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	// Handle search submission
	const handleSearch = () => {
		performAdvancedSearch(filters);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setFilters({
			searchTerm: '',
			resourceTypes: [],
			locations: [],
			categories: [],
			capacityMin: undefined,
			capacityMax: undefined,
			features: [],
			academicPrograms: [],
			includeUnavailable: false,
			availabilityWindow: {
				start: new Date(),
				end: new Date(Date.now() + 2 * 60 * 60 * 1000)
			},
			sortBy: 'name',
			sortOrder: 'asc',
			page: 1,
			limit: 20
		});
		clearResults();
	};

	const activeFiltersCount = useMemo(() => {
		let count = 0;

		if (filters.searchTerm) count++;

		if (filters.resourceTypes?.length) count++;

		if (filters.locations?.length) count++;

		if (filters.categories?.length) count++;

		if (filters.capacityMin || filters.capacityMax) count++;

		if (filters.features?.length) count++;

		if (filters.academicPrograms?.length) count++;

		return count;
	}, [filters]);

	if (error) {
		return (
			<Container
				maxWidth="lg"
				sx={{ mt: 4, mb: 4 }}
			>
				<Alert severity="error">{t('advancedSearch.error', 'An error occurred while searching')}</Alert>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="lg"
			sx={{ mt: 4, mb: 4 }}
		>
			{/* Page Header */}
			<Box sx={{ mb: 3 }}>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
				>
					{t('advancedSearch.title', 'Advanced Search')}
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
				>
					{t('advancedSearch.subtitle', 'Find the perfect resource for your needs')}
				</Typography>
			</Box>

			{/* Search Filters Section */}
			<Paper
				sx={{ p: 3, mb: 3 }}
				elevation={2}
			>
				{/* Main Search Bar */}
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
					alignItems="center"
					sx={{ mb: 3 }}
				>
					<TextField
						fullWidth
						label={t('advancedSearch.searchTerm', 'Search resources...')}
						value={filters.searchTerm}
						onChange={(e) => updateFilter('searchTerm', e.target.value)}
						InputProps={{
							startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
						}}
					/>
					<Button
						variant="contained"
						onClick={handleSearch}
						disabled={loading.search}
						startIcon={<SearchIcon />}
						sx={{ minWidth: '120px' }}
					>
						{loading.search ? t('common.searching', 'Searching...') : t('common.search', 'Search')}
					</Button>
				</Stack>

				{/* Filter Icon with Badge */}
				<Badge
					badgeContent={activeFiltersCount}
					color="primary"
				>
					<FilterListIcon />
				</Badge>

				{/* Advanced Filters Toggle */}
				<Box sx={{ mb: showFilters ? 3 : 0 }}>
					<Button
						variant="outlined"
						onClick={() => setShowFilters(!showFilters)}
						startIcon={<FilterListIcon />}
						sx={{ mb: 2 }}
					>
						{showFilters
							? t('common.hideFilters', 'Hide Filters')
							: t('common.showFilters', 'Show Filters')}
					</Button>
				</Box>

				{/* Filter Options */}
				{showFilters && (
					<Stack spacing={3}>
						{/* Resource Types */}
						<FormControl fullWidth>
							<InputLabel>{t('advancedSearch.resourceTypes', 'Resource Types')}</InputLabel>
							<Select
								multiple
								value={filters.resourceTypes}
								onChange={(e) => updateFilter('resourceTypes', e.target.value as string[])}
								renderValue={(selected) => (
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
										{(selected as string[]).map((value) => (
											<Chip
												key={value}
												label={value}
												size="small"
											/>
										))}
									</Box>
								)}
							>
								<MenuItem value="classroom">{t('resources.classroom', 'Classroom')}</MenuItem>
								<MenuItem value="laboratory">{t('resources.laboratory', 'Laboratory')}</MenuItem>
								<MenuItem value="auditorium">{t('resources.auditorium', 'Auditorium')}</MenuItem>
								<MenuItem value="equipment">{t('resources.equipment', 'Equipment')}</MenuItem>
							</Select>
						</FormControl>

						{/* Locations */}
						<FormControl fullWidth>
							<InputLabel>{t('advancedSearch.locations', 'Locations')}</InputLabel>
							<Select
								multiple
								value={filters.locations}
								onChange={(e) => updateFilter('locations', e.target.value as string[])}
								renderValue={(selected) => (
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
										{(selected as string[]).map((value) => (
											<Chip
												key={value}
												label={value}
												size="small"
											/>
										))}
									</Box>
								)}
							>
								<MenuItem value="building-a">{t('locations.buildingA', 'Building A')}</MenuItem>
								<MenuItem value="building-b">{t('locations.buildingB', 'Building B')}</MenuItem>
								<MenuItem value="library">{t('locations.library', 'Library')}</MenuItem>
							</Select>
						</FormControl>

						{/* Capacity Range */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
						>
							<TextField
								label={t('advancedSearch.capacityMin', 'Min Capacity')}
								type="number"
								value={filters.capacityMin || ''}
								onChange={(e) =>
									updateFilter('capacityMin', e.target.value ? parseInt(e.target.value) : undefined)
								}
								sx={{ flex: 1 }}
							/>
							<Typography variant="body2">-</Typography>
							<TextField
								label={t('advancedSearch.capacityMax', 'Max Capacity')}
								type="number"
								value={filters.capacityMax || ''}
								onChange={(e) =>
									updateFilter('capacityMax', e.target.value ? parseInt(e.target.value) : undefined)
								}
								sx={{ flex: 1 }}
							/>
						</Stack>

						{/* Action Buttons */}
						<Stack
							direction="row"
							spacing={2}
							justifyContent="flex-end"
						>
							<Button
								variant="outlined"
								onClick={handleClearFilters}
								startIcon={<ClearIcon />}
							>
								{t('common.clearFilters', 'Clear Filters')}
							</Button>
							<Button
								variant="contained"
								onClick={clearResults}
								color="secondary"
							>
								{t('common.clearResults', 'Clear Results')}
							</Button>
						</Stack>
					</Stack>
				)}
			</Paper>

			{/* Loading State */}
			{loading.search && (
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography
						variant="h6"
						sx={{ mb: 2 }}
					>
						{t('common.loading', 'Searching...')}
					</Typography>
					<Stack spacing={2}>
						{[1, 2, 3].map((index) => (
							<Skeleton
								key={index}
								variant="rectangular"
								height={100}
							/>
						))}
					</Stack>
				</Paper>
			)}

			{/* Search Results */}
			{searchResults && searchResults.data && searchResults.data.length > 0 && (
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography
						variant="h6"
						sx={{ mb: 2 }}
					>
						{t('advancedSearch.resultsFound', 'Search Results')} ({searchResults.data.length})
					</Typography>
					<Stack spacing={2}>
						{searchResults.data.map((resource, index) => (
							<Card
								key={resource.id || index}
								variant="outlined"
							>
								<CardContent>
									<Typography
										variant="h6"
										gutterBottom
									>
										{resource.name}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										gutterBottom
									>
										{resource.type} • {resource.location}
									</Typography>
									{resource.capacity && (
										<Typography
											variant="caption"
											display="block"
										>
											{t('resources.capacity', 'Capacity')}: {resource.capacity}
										</Typography>
									)}
									{resource.features && resource.features.length > 0 && (
										<Box sx={{ mt: 1 }}>
											{resource.features.map((feature, idx) => (
												<Chip
													key={idx}
													label={feature}
													size="small"
													sx={{ mr: 0.5, mb: 0.5 }}
												/>
											))}
										</Box>
									)}
								</CardContent>
							</Card>
						))}
					</Stack>
				</Paper>
			)}

			{/* No Results Message */}
			{searchResults && searchResults.data && searchResults.data.length === 0 && filters.searchTerm && (
				<Paper sx={{ p: 3, textAlign: 'center' }}>
					<Typography
						variant="h6"
						gutterBottom
					>
						{t('advancedSearch.noResults', 'No results found')}
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						{t(
							'advancedSearch.noResultsDescription',
							'Try adjusting your search criteria or clear filters to see all resources.'
						)}
					</Typography>
				</Paper>
			)}
		</Container>
	);
}
