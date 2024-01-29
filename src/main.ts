import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();
  app.setGlobalPrefix("/api/v1");
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT);
  console.log("Server Start Port:", process.env.PORT);
}
bootstrap();
