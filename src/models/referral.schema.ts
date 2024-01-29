import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose from "mongoose";

@Schema()
export class Referral {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  phoneNumber: number;

  @Prop()
  reason: string;

  @Prop()
  //businessName
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const ReferralSchema = SchemaFactory.createForClass(Referral);
