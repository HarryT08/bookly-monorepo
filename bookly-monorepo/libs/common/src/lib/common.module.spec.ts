import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from './common.module';

describe('CommonModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
