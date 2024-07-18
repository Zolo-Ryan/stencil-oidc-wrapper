import { Test, TestingModule } from '@nestjs/testing';
import { OpenidService } from './openid.service';

describe('OpenidService', () => {
  let service: OpenidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenidService],
    }).compile();

    service = module.get<OpenidService>(OpenidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
