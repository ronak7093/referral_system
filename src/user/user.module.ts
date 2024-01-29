import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { S3Service } from "src/s3/s3.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "src/models/user.schema";
import { UserMetaSchema } from "src/models/userMeta.schema";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { ReferralSchema } from "src/models/referral.schema";
import { ReferralMetaSchema } from "src/models/referralMeta.schema";
import { EmailService } from "src/email/email.service";
import { FileMetaSchema } from "src/models/file.schema";
import { UserDeviceInformationMetaSchema } from "src/models/user.deviceinformation.schema";

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
  ],
  controllers: [UserController],
  providers: [UserService, S3Service, AuthService, JwtService, EmailService],
})
export class UserModule {}
