import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 8,
    maxlength: 60,
  })
  password: string;

  @Prop({ required: true })
  smsNumber: number;

  @Prop({ required: true })
  website: string;

  @Prop({ required: true })
  businessType: string;

  @Prop({ required: true })
  aboutMyBusiness: string;

  @Prop({ required: true })
  myPerfectClient: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual("UserMeta", {
  ref: "UserMeta",
  localField: "_id",
  foreignField: "user",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("Referral", {
  ref: "Referral",
  localField: "_id",
  foreignField: "user",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("FileMeta", {
  ref: "FileMeta",
  localField: "_id",
  foreignField: "user",
});
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("UserDeviceInformation", {
  ref: "UserDeviceInformation",
  localField: "_id",
  foreignField: "user",
});
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });
