import { PrismaClient } from '@prisma/client';
import { Adapter, AdapterPayload } from 'oidc-provider';

export class MyAdapter implements Adapter {
  private name: string;
  private prisma: PrismaClient;
  constructor(name: string) {
    this.name = name;
    this.prisma = new PrismaClient();
  }

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void> {
    console.log('UPSERT', this.name, id, payload, expiresIn);
    if (this.name === 'Interaction') {
      const interaction = await this.prisma.interaction.findUnique({
        where: { id },
      });
      if (interaction) {
        await this.prisma.interaction.update({
          where: { id },
          data: { val: JSON.stringify(payload) },
        });
        return;
      }
      await this.prisma.interaction.create({
        data: {
          val: JSON.stringify(payload),
          id,
        },
      });
    } else if (this.name === 'Session') {
      const session = await this.prisma.session.findUnique({
        where: { id },
      });
      if (session) {
        await this.prisma.session.update({
          where: { id },
          data: { val: JSON.stringify(payload) },
        });
        return;
      }
      await this.prisma.session.create({
        data: { val: JSON.stringify(payload), id, uid: payload.uid },
      });
    } else if (this.name === 'Grant') {
      const grant = await this.prisma.grant.findUnique({ where: { id } });
      if (grant) {
        await this.prisma.grant.update({
          where: { id },
          data: { val: JSON.stringify(payload) },
        });
      }
      await this.prisma.grant.create({
        data: { id, val: JSON.stringify(payload) },
      });
    }
  }

  async find(id: string): Promise<void | AdapterPayload> {
    console.log('FIND', this.name, id);
    if (this.name === 'Interaction') {
      const val = await this.prisma.interaction.findUnique({ where: { id } });
      if (!val) return null;
      console.log('done');
      return JSON.parse(val.val);
    } else if (this.name === 'Session') {
      const val = await this.prisma.session.findUnique({ where: { id } });
      if (!val) return null;
      console.log('done');

      return JSON.parse(val.val);
    } else if (this.name === 'Grant') {
      const grant = await this.prisma.grant.findUnique({ where: { id } });
      console.log('hi', grant);
      const val = JSON.parse(grant?.val) as AdapterPayload;
      if (grant)
        return {
          grantId: grant.id,
          grant_types: ['AccessToken'],
          ...val,
        };
      return { grantId: id };
    }
  }

  async findByUid(uid: string): Promise<void | AdapterPayload> {
    console.log('FINDBYUID', this.name, uid);
    if (this.name === 'Session') {
      const session = await this.prisma.session.findUnique({
        where: { uid },
      });
      console.log(session, 'done');
      return JSON.parse(session.val);
    }
  }

  async findByUserCode(userCode: string): Promise<void | AdapterPayload> {
    console.log('USERCODE', this.name, userCode);
  }

  async consume(id: string): Promise<void> {
    console.log('consume', this.name, id);
  }

  async destroy(id: string): Promise<void> {
    console.log('destroy', this.name, id);
    if (this.name === 'Interaction') {
      const find = await this.prisma.interaction.findUnique({ where: { id } });
      if (find) {
        await this.prisma.interaction.delete({ where: { id } });
      }
    } else if (this.name === 'Session') {
      const find = await this.prisma.session.findUnique({ where: { id } });
      if (find) {
        await this.prisma.session.delete({ where: { id } });
      }
    }
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    console.log('revokbyGrantId', this.name, grantId);
  }
}
