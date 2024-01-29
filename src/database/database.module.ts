import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
require("dotenv").config({ path: ".env" });

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: process.env.MONGO_DATABASENAME,
    }),
  ],
  exports: [],
})
export class DatabaseModule {}
