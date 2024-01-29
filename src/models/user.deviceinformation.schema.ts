import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose from "mongoose";

@Schema()
export class UserDeviceInformation {
  @Prop()
  deviceId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const UserDeviceInformationMetaSchema = SchemaFactory.createForClass(
  UserDeviceInformation
);
