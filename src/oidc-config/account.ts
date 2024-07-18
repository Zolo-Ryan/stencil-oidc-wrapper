import { Account, FindAccount } from 'oidc-provider';
import { PrismaService } from 'src/prisma/prisma.service';

export class Accounts {
  private accountId: string;
  private profile: any;
  constructor(
    id: string,
    profile: any,
    private readonly prismaService: PrismaService,
  ) {
    this.accountId = id;
    this.profile = profile;
  }

  async claims(use, scope) {
    // eslint-disable-line no-unused-vars
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name,
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim

      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000',
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin',
    };
  }

  static async findAccount(ctx, id, token): Promise<Account> {
    const prismaService: PrismaService = new PrismaService();
    const user = await prismaService.user.findUnique({ where: { email: id } });
    console.log('hi', user);
    if (!user) return null;
    return {
      accountId: user.id,
      claims: async (use, scope) => {
        return {
          sub: user.id,
          email: user.email,
          email_verified: true,
          family_name: 'this.profile.family_name',
          given_name: 'this.profile.given_name',
          locale: 'this.profile.locale',
          name: 'this.profile.name',
        };
      },
      profile: 'something',
    };
  }
}
