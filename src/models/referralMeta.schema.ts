import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Referral } from "./referral.schema";

@Schema()
export class ReferralMeta {
  @Prop()
  dealValue: Number;

  @Prop()
  status: string;

  @Prop()
  note: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Referral" })
  referral: Referral;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const ReferralMetaSchema = SchemaFactory.createForClass(ReferralMeta);

// ReferralMetaSchema.virtual("Referral", {
//   ref: "Referral",
//   localField: "_id",
//   foreignField: "referral",
// });

// ReferralMetaSchema.set("toObject", { virtuals: true });
// ReferralMetaSchema.set("toJSON", { virtuals: true });
