import { Module } from '@nestjs/common';
import { OidcConfigService } from './oidc-config.service';

@Module({
  providers: [OidcConfigService],
  exports: [OidcConfigService],
})
export class OidcConfigModule {}
