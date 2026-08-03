import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend communication
  const allowedOrigins = [
    ...(process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://eagle-front.onrender.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('APIs for EAGLE Consultation App')
    .setDescription(
      'Complete REST API documentation for the EAGLE consultation platform. ' +
      'Use Authorize to add a JWT access token when testing protected endpoints.',
    )
    .setVersion('1.0')
    .setContact('EAGLE Team', 'https://eagle.cm', 'support@eagle.cm')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Users', 'User management (Admin only)')
    .addTag('RBAC', 'Role-based access control')
    .addTag('Permissions', 'Permissions and role assignments')
    .addTag('Patients', 'Patient registration and management')
    .addTag('Consultations', 'Video consultation management')
    .addTag('WebRTC', 'Video consultation rooms and signaling')
    .addTag('Hospitals', 'Hospital/Center management')
    .addTag('Queue', 'Patient queue management')
    .addTag('Urgencies', 'Urgency request management')
    .addTag('Followups', 'Patient follow-up management')
    .addTag('Preparations', 'Consultation preparation workflows')
    .addTag('Prescriptions', 'Medical prescriptions')
    .addTag('Specialties', 'Medical specialties')
    .addTag('Notifications', 'Push notifications')
    .addTag('Messages', 'Chat messaging')
    .addTag('Files', 'File uploads')
    .addTag('Reports', 'Medical reports')
    .addTag('Complaints', 'Complaint management')
    .addTag('Referrals', 'Patient referral workflows')
    .addTag('Calendar', 'Appointments and calendar events')
    .addTag('Analytics', 'System analytics')
    .addTag('Activities', 'Activity and audit history')
    .addTag('Sync', 'Offline data synchronization')
    .addTag('Rules', 'Clinical and workflow rules')
    .addTag('Help', 'Help articles and frequently asked questions')
    .addTag('System Modules', 'Hospital module configuration')
    .addTag('System', 'System administration')
    .addTag('Tickets', 'Support ticket management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'APIs for EAGLE Consultation App',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
