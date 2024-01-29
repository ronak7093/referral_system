import { Injectable, NestMiddleware } from "@nestjs/common";
import { UserMeta, UserMetaSchema } from "../models/userMeta.schema";
import gm from "gm";
import { S3Init } from "../s3/s3";
import { NextFunction } from "express";

const s3 = S3Init();
@Injectable()
export class UserMetaMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    UserMetaSchema.post("save", async function (doc: UserMeta) {
      console.log("after insert middleware called");
      try {
        const readStream = s3
          .getObject({
            Key: doc.key,
            Bucket: doc.bucket,
          })
          .createReadStream();
        //@ts-ignore
        const stream = gm(readStream, doc.originalName)
          .resize(500, 500)
          .stream();
        const params = {
          Body: stream,
          Bucket: doc.bucket,
          Key: doc.key,
        };
        await s3.upload(params).promise();
        console.log("Thumbnail uploaded successfully.");
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
      }
      next();
    });
  }
}

// import { Injectable, NestMiddleware } from "@nestjs/common";
// import { Request, Response, NextFunction } from "express";
// import gm from "gm";
// import { S3Init } from "../s3/s3";

// const s3 = S3Init();

// @Injectable()
// export class UserMetaMiddleware implements NestMiddleware {
//   async use(req: Request, res: Response, next: NextFunction) {
//     try {
//       // Assuming you have the file key and bucket in your request body or query params
//       const { key, bucket } = req.body;

//       // Fetch the image from S3
//       const readStream = s3
//         .getObject({ Key: key, Bucket: bucket })
//         .createReadStream();

//       // Resize the image using gm
//       const stream = gm(readStream).resize(500, 500).stream();

//       // Upload the resized image back to S3
//       const params = {
//         Body: stream,
//         Bucket: bucket,
//         Key: key + "_resized",
//       };
//       await s3.upload(params).promise();

//       console.log("Thumbnail resized and uploaded successfully.");
//     } catch (error) {
//       console.error("Error resizing and uploading thumbnail:", error);
//     }

//     next();
//   }
// }
