import { Injectable } from "@nestjs/common";
import { S3Init } from "../s3/s3";

var s3 = S3Init();

@Injectable()
export class S3Service {
  async uploadFileToS3(bucket: string, key: string, file: Buffer) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: file,
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  async doGetSignedUrl(key): Promise<string> {
    return s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Expires: 18000,
    });
  }
}
