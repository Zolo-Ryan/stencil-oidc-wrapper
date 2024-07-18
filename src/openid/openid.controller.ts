import { Controller, Req, Res, All } from '@nestjs/common';
import { Request, Response } from 'express';
import { OidcConfigService } from 'src/oidc-config/oidc-config.service';

@Controller('oidc')
export class OpenidController {
  private oidc;
  constructor(private readonly oidcConfigService: OidcConfigService) {
    this.oidcConfigService.returnOidc().then((resolve) => {
      this.oidc = resolve;
      console.log('hi', resolve);
    });
  }
  @All('/*')
  public async mountedOidc(@Req() req: Request, @Res() res: Response) {
    req.url = req.originalUrl.replace('/oidc', '');
    const callback = await this.oidc.callback();
    return callback(req, res);
  }
}
