import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { ParentsModule } from './modules/parents/parents.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { MarksModule } from './modules/marks/marks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { FeesModule } from './modules/fees/fees.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './config/redis/redis.module';
import { AwsModule } from './config/s3/s3.module';
import { AiModule } from './ai/ai.module';
import { WebsocketModule } from './realtime/websocket/websocket.module';
import { PushModule } from './realtime/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService): Promise<any> => {
        const logger = new Logger('CacheModule');
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        try {
          const store = await Promise.race([
            redisStore({ socket: { host, port } }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Redis connection timeout')), 1500),
            ),
          ]);
          logger.log(`Connected to Redis at ${host}:${port}`);
          return { store };
        } catch (err) {
          logger.warn(`Redis unavailable (${(err as Error).message}). Falling back to in-memory cache.`);
          return {};
        }
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    RedisModule,
    AwsModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    FacultyModule,
    ParentsModule,
    DepartmentsModule,
    CoursesModule,
    AttendanceModule,
    AssignmentsModule,
    ExamsModule,
    MarksModule,
    NotificationsModule,
    TimetableModule,
    FeesModule,
    PaymentsModule,
    ChatModule,
    AnalyticsModule,
    AdmissionsModule,
    DocumentsModule,
    AiModule,
    WebsocketModule,
    PushModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
