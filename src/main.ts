// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   app.enableCors({
//     origin: ['http://localhost:3000' , 'https://linkedin-post-schedular-frontend.vercel.app'],
//     credentials: true,
//   });
  
//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }));

//   const port = process.env.PORT || 3001;
//   await app.listen(port);
//   console.log(`Backend running on http://localhost:${port}`);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://linkedin-post-schedular-frontend.vercel.app'],
    credentials: true,
  });
  
  // Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('PostAgent API')
    .setDescription('LinkedIn AI Post Scheduler API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('posts', 'Post management and AI generation')
    .addTag('linkedin', 'LinkedIn OAuth and publishing')
    .addTag('schedules', 'Recurring schedule management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for later reference
    )
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://stayeasy.online', 'Production')
    .setContact(
      'PostAgent Support',
      'https://stayeasy.online',
      'support@stayeasy.online',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PostAgent API Docs',
    customfavIcon: 'https://stayeasy.online/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();