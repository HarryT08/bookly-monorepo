export enum RestrictionLevelPenalty {
  NONE = 'NONE', // No restrictions
  LIMITED_RESERVATIONS = 'LIMITED_RESERVATIONS', // Reduce max reservations
  NO_ADVANCE_RESERVATIONS = 'NO_ADVANCE_RESERVATIONS', // Only same-day reservations
  SPECIFIC_RESOURCES_ONLY = 'SPECIFIC_RESOURCES_ONLY', // Only certain resources
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED', // All reservations need approval
  NO_RESERVATIONS = 'NO_RESERVATIONS' // Cannot make any reservations
}
