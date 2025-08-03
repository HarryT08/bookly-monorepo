import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Timestamp of the response' })
  timestamp: string;

  @ApiProperty({ description: 'Request path' })
  path: string;
}

export class SuccessResponseDto<T> extends BaseResponseDto {
  @ApiProperty({ description: 'Response data' })
  data: T;
}

export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Error code' })
  code: string;

  @ApiProperty({ description: 'Error type' })
  type: string;

  @ApiProperty({ description: 'Exception code' })
  exception_code: string;

  @ApiProperty({ description: 'HTTP status code' })
  http_code: number;

  @ApiProperty({ description: 'HTTP exception name' })
  http_exception: string;

  @ApiProperty({ description: 'Additional error details', required: false })
  errors?: string[];
}
