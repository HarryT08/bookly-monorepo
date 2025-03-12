import { Test, TestingModule } from '@nestjs/testing';
import { DtoModule } from './dto.module';

describe('DtoModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DtoModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
