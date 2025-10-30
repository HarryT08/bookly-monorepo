import { Controller, Post, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  ApiResponseBookly,
  SuccessResponseDto,
} from "@libs/dto/common/response.dto";
import { ResponseUtil } from "@libs/common/utils/response.util";
import { SeedService } from "@libs/common/services/seed.service";

@ApiTags("Seed")
@Controller("seed")
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get("status")
  @ApiOperation({
    summary: "Check if database needs seeding",
    description:
      "Returns whether the database is empty and needs initial seeding",
  })
  @ApiResponse({
    status: 200,
    description: "Database seeding status",
    type: SuccessResponseDto,
  })
  async checkSeedingStatus(): Promise<
    ApiResponseBookly<{ needsSeeding: boolean }>
  > {
    const needsSeeding = await this.seedService.needsSeeding();

    const data = {
      needsSeeding,
      message: needsSeeding
        ? "Database is empty and needs seeding"
        : "Database already contains data",
    };

    return ResponseUtil.success(data, "Seeding status retrieved successfully");
  }

  @Post("run")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Run database seeding",
    description:
      "Initializes the database with basic data if it is empty. This includes programs, roles, permissions, users, categories, maintenance types, resources, and basic availability.",
  })
  @ApiResponse({
    status: 200,
    description: "Seeding completed successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Seeding failed or database already contains data",
  })
  async runSeeding(): Promise<
    ApiResponseBookly<{
      success: boolean;
      message: string;
      summary?: {
        programs: number;
        roles: number;
        users: number;
        categories: number;
        maintenanceTypes: number;
        resources: number;
      };
    }>
  > {
    const result = await this.seedService.runSeeding();
    return ResponseUtil.success(
      result,
      "Database seeding completed successfully"
    );
  }

  @Post("run-full")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Run full database seeding (force mode)",
    description:
      "Clears all existing data and reinitializes the database with fresh data. WARNING: This will delete all existing data including users, roles, resources, etc.",
  })
  @ApiResponse({
    status: 200,
    description: "Full seeding completed successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Full seeding failed",
  })
  async runFullSeeding(): Promise<
    ApiResponseBookly<{
      success: boolean;
      message: string;
      summary?: {
        programs: number;
        roles: number;
        users: number;
        categories: number;
        maintenanceTypes: number;
        resources: number;
      };
    }>
  > {
    const result = await this.seedService.runFullSeeding();
    return ResponseUtil.success(
      result,
      "Full database seeding completed successfully"
    );
  }
}
