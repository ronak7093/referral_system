import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { S3Service } from "./s3/s3.service";
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule],
  controllers: [AppController, EmailController],
  providers: [AppService, S3Service, EmailService],
})
export class AppModule {}
