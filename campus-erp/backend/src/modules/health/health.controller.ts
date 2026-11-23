import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../config/redis/redis.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: false,
        redis: false,
        api: true,
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      healthStatus.services.database = true;
    } catch (error) {
      healthStatus.status = 'degraded';
    }

    try {
      await this.redis.set('health-check', 'ok', 10);
      healthStatus.services.redis = true;
    } catch (error) {
      healthStatus.status = 'degraded';
    }

    return healthStatus;
  }
}
