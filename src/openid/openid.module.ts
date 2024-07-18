import { Module } from '@nestjs/common';
import { OpenidController } from './openid.controller';
import { OpenidService } from './openid.service';
import { OidcConfigModule } from 'src/oidc-config/oidc-config.module';

@Module({
  imports: [OidcConfigModule],
  controllers: [OpenidController],
  providers: [OpenidService]
})
export class OpenidModule {}
