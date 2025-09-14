import { ICommand } from '@nestjs/cqrs';

/**
 * Assign Resource Responsible Command
 */
export class AssignResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly assignedBy: string,
    public readonly isActive: boolean = true
  ) {}
}

/**
 * Create Resource Responsible Command
 */
export class CreateResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly assignedBy: string,
    public readonly isActive: boolean = true
  ) {}
}

/**
 * Update Resource Responsible Command
 */
export class UpdateResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string
  ) {}
}

/**
 * Delete Resource Responsible Command
 */
export class DeleteResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string
  ) {}
}

/**
 * Remove Resource Responsible Command
 */
export class RemoveResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly removedBy: string
  ) {}
}

/**
 * Assign Multiple Resource Responsible Command
 */
export class AssignMultipleResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userIds: string[],
    public readonly assignedBy: string
  ) {}
}

/**
 * Replace Resource Responsibles Command
 */
export class ReplaceResourceResponsiblesCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userIds: string[],
    public readonly replacedBy: string
  ) {}
}

/**
 * Deactivate All Resource Responsibles Command
 */
export class DeactivateAllResourceResponsiblesCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly deactivatedBy: string
  ) {}
}
