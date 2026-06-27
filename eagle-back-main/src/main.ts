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
    process.env.FRONTEND_URL,
    'http://localhost:3001',
    'https://eagle-front.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

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
    .setTitle('EAGLE Telemedicine API')
    .setDescription(
      'API documentation for the EAGLE telemedicine network platform. ' +
      'EAGLE connects secondary health centers to specialist doctors at the primary center via teleconsultation.',
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
    .addTag('Patients', 'Patient registration and management')
    .addTag('Consultations', 'Video consultation management')
    .addTag('Hospitals', 'Hospital/Center management')
    .addTag('Queue', 'Patient queue management')
    .addTag('Urgencies', 'Urgency request management')
    .addTag('Prescriptions', 'Medical prescriptions')
    .addTag('Specialties', 'Medical specialties')
    .addTag('Notifications', 'Push notifications')
    .addTag('Messages', 'Chat messaging')
    .addTag('Files', 'File uploads')
    .addTag('Reports', 'Medical reports')
    .addTag('Analytics', 'System analytics')
    .addTag('System', 'System administration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
