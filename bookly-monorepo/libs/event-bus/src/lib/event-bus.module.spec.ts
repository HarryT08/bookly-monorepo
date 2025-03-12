import { Test, TestingModule } from '@nestjs/testing';
import { EventBusModule } from './event-bus.module';

describe('EventBusModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventBusModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
