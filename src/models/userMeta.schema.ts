import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose from "mongoose";
import { S3Init } from "./../s3/s3";

var s3 = S3Init();

@Schema()
export class UserMeta {
  // image
  @Prop()
  headShort: string;

  @Prop()
  mineType: string;

  @Prop()
  size: number;

  @Prop()
  bucket: string;

  @Prop()
  key: string;

  @Prop()
  location: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  url: string;

  // public getSignedURL() {
  //   return s3.getSignedUrl("getObject", {
  //     Bucket: process.env.AWS_BUCKET,
  //     Key: this.key,
  //     Expires: 18000,
  //   });
  // }
}
export const UserMetaSchema = SchemaFactory.createForClass(UserMeta);

UserMetaSchema.post("save", async function (next) {
  if (this.key) {
    // Update 'location' with the S3 URL
    const signedUrl = await s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET,
      Key: this.key,
      Expires: 18000,
    });
    this.location = signedUrl;
  }
});

// UserMetaSchema.on("save", async function (next) {
//   if (this.key) {
//     console.log(this.key, "key");
//     const signedUrl = s3.getSignedUrl("putObject", {
//       Bucket: process.env.AWS_BUCKET,
//       Key: this.key,
//       Expires: 18000,
//     });
//     this.location = signedUrl;
//   }
// });

UserMetaSchema.pre("save", async function (next) {
  if (this.key) {
    // Update 'location' with the S3 URL
    const signedUrl = await s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET,
      Key: this.key,
      Expires: 18000,
    });
    this.location = signedUrl;
  }
});
