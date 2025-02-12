import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './common/swagger';
import { EnvironmentVariables } from './common/env.validation';
import { GlobalValidationPipe } from './common/validation.pipe';
import { AllExceptionsFilter } from './common/exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_GROUP_ID } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get env config
  const configService: ConfigService<EnvironmentVariables> = app.get(ConfigService);

  // Connect to Kafka as Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      consumer: { groupId: KAFKA_GROUP_ID },
      client: { brokers: [`${configService.get('KAFKA_HOST')}:${configService.get('KAFKA_PORT')}`] },
    },
  });

  // Start Transporter
  await app.startAllMicroservices();

  // Apply the exception filter globally
  app.useGlobalFilters(new AllExceptionsFilter());

  // Add global validation pipe
  app.useGlobalPipes(GlobalValidationPipe);

  // Security middleware
  app.use(helmet());

  // Add Logger
  app.useLogger(app.get(Logger));

  // Swagger config
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);

  // Start the app
  await app.listen(configService.get('BACKEND_PORT'), '0.0.0.0', async () => {
    console.log(`server is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
