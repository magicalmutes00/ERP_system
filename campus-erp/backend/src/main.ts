import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://192.168.1.3:4000',
      /\.local$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Campus ERP API')
    .setDescription('AI-Powered Campus ERP + LMS Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Auth endpoints')
    .addTag('Users', 'User management')
    .addTag('Students', 'Student management')
    .addTag('Faculty', 'Faculty management')
    .addTag('Courses', 'Course management')
    .addTag('Attendance', 'Attendance tracking')
    .addTag('Exams', 'Examination management')
    .addTag('Assignments', 'Assignment management')
    .addTag('Fees', 'Fee management')
    .addTag('Timetable', 'Timetable management')
    .addTag('Notifications', 'Notification management')
    .addTag('AI', 'AI-powered features')
    .addTag('Analytics', 'Analytics and reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
