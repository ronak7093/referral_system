import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "src/models/user.schema";
import { JwtStrategy } from "./jwt.strategy";
import { UserService } from "src/user/user.service";
import { UserMetaSchema } from "src/models/userMeta.schema";
import { ReferralSchema } from "src/models/referral.schema";
import { ReferralMetaSchema } from "src/models/referralMeta.schema";
import { FileMetaSchema } from "src/models/file.schema";
import { UserDeviceInformationMetaSchema } from "src/models/user.deviceinformation.schema";
import { S3Service } from "src/s3/s3.service";
import { EmailService } from "src/email/email.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "UserMeta", schema: UserMetaSchema },
      { name: "Referral", schema: ReferralSchema },
      { name: "ReferralMeta", schema: ReferralMetaSchema },
      { name: "FileMeta", schema: FileMetaSchema },
      {
        name: "UserDeviceInformation",
        schema: UserDeviceInformationMetaSchema,
      },
    ]),
    // UserModule,
  ],
  controllers: [AuthController],
  providers: [
    S3Service,
    EmailService,
    JwtService,
    AuthService,
    JwtStrategy,
    UserService,
  ],
  exports: [JwtStrategy, UserService, AuthService],
})
export class AuthModule {}
