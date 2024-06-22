import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplicationService } from './application.service';
import { ApplicationRolesService } from 'src/application/application-roles/application-roles.service';
import { ApplicationScopesService } from 'src/application/application-scopes/application-scopes.service';
import { HeaderAuthService } from 'src/header-auth/header-auth.service';
import { KeyService } from 'src/key/key.service';
import { DomainPinningService } from 'src/domain-pinning/domain-pinning.service';

@Module({
  controllers: [ApplicationController],
  providers: [PrismaService, ApplicationService,ApplicationRolesService,ApplicationScopesService,DomainPinningService,HeaderAuthService,KeyService]
})
export class ApplicationModule {}
