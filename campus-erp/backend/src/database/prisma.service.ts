import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to MySQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from MySQL database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    const tablenames = await this.$queryRaw<
      Array<{ TABLE_NAME: string }>
    >`SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE()`;
    
    for (const { TABLE_NAME } of tablenames) {
      if (TABLE_NAME !== '_prisma_migrations') {
        await this.$executeRawUnsafe(
          `TRUNCATE TABLE \`${TABLE_NAME}\`;`,
        );
      }
    }
  }
}
