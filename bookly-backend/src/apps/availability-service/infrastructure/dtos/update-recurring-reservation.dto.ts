/**
 * DTO for updating recurring reservations (RF-12)
 */

import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateRecurringReservationDto } from './create-recurring-reservation.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum UpdateScope {
  FUTURE_ONLY = 'FUTURE_ONLY',
  ALL_INSTANCES = 'ALL_INSTANCES',
  CONFIGURATION_ONLY = 'CONFIGURATION_ONLY'
}

export class UpdateRecurringReservationDto extends PartialType(CreateRecurringReservationDto) {
  @ApiProperty({
    description: 'Scope of the update - affects which instances are modified',
    enum: UpdateScope,
    example: UpdateScope.FUTURE_ONLY,
    default: UpdateScope.FUTURE_ONLY,
    required: false
  })
  @IsOptional()
  @IsEnum(UpdateScope)
  updateScope?: UpdateScope = UpdateScope.FUTURE_ONLY;

  @ApiProperty({
    description: 'Reason for the update (for audit purposes)',
    example: 'Room change due to maintenance',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  updateReason?: string;

  @ApiProperty({
    description: 'Whether to send notifications about the update',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  notifyUsers?: boolean = true;

  @ApiProperty({
    description: 'Whether to regenerate instances after update',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  regenerateInstances?: boolean = true;
}
