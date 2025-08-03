import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvailabilityService } from '../../application/services/availability.service';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all availability slots' })
  @ApiResponse({ status: 200, description: 'Availability slots retrieved successfully' })
  async findAll() {
    return this.availabilityService.findAll();
  }

  @Get('resource/:resourceId')
  @ApiOperation({ summary: 'Get availability by resource ID' })
  @ApiResponse({ status: 200, description: 'Resource availability retrieved successfully' })
  async findByResourceId(@Param('resourceId') resourceId: string) {
    return this.availabilityService.findByResourceId(resourceId);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check availability for a time slot' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(@Body() data: { resourceId: string; startDate: Date; endDate: Date }) {
    return this.availabilityService.checkAvailability(data.resourceId, data.startDate, data.endDate);
  }

  @Post('reservations')
  @ApiOperation({ summary: 'Create new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  async createReservation(@Body() data: any) {
    return this.availabilityService.createReservation(data);
  }

  @Put('reservations/:id')
  @ApiOperation({ summary: 'Update reservation' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
  async updateReservation(@Param('id') id: string, @Body() data: any) {
    return this.availabilityService.updateReservation(id, data);
  }

  @Delete('reservations/:id')
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
  async cancelReservation(@Param('id') id: string) {
    return this.availabilityService.cancelReservation(id);
  }
}
