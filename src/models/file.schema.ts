import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose from "mongoose";

@Schema()
export class FileMeta {
  @Prop()
  originalName: string;

  @Prop()
  file: string;

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

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const FileMetaSchema = SchemaFactory.createForClass(FileMeta);
