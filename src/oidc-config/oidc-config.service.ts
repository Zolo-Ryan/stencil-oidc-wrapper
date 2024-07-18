import { Injectable } from '@nestjs/common';
import { Configuration } from 'oidc-provider';
import { MyAdapter } from './adapter';
import { Accounts } from './account';

@Injectable()
export class OidcConfigService {
  private Provider;
  private configuration: Configuration = {
    clients: [
      {
        client_id: 'myminioadmin',
        client_name: 'FirstClient',
        client_secret: 'minio-secret-key-change-me',
        redirect_uris: ['http://localhost:4180/oauth2/callback'],
      },
    ],
    adapter: MyAdapter,
    interactions: {
      url(ctx, interaction) {
        return `/interaction/${interaction.uid}`;
      },
    },
    findAccount: Accounts.findAccount,
  };

  async returnOidc() {
    if (typeof this.Provider !== 'undefined') {
      return this.Provider;
    }
    let Provider;
    const mod = await eval(`import('oidc-provider')`);
    ({ Provider } = mod);
    this.Provider = Provider;
    const oidc = new this.Provider(process.env.FULL_URL, this.configuration);
    return oidc;
  }
}
