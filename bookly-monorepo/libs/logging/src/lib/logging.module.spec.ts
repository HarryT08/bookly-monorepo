import { Test, TestingModule } from '@nestjs/testing';
import { LoggingModule } from './logging.module';

describe('LoggingModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LoggingModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
