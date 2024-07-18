import { Test, TestingModule } from '@nestjs/testing';
import { OidcConfigService } from './oidc-config.service';

describe('OidcConfigService', () => {
  let service: OidcConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcConfigService],
    }).compile();

    service = module.get<OidcConfigService>(OidcConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
