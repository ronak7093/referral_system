import aws from "aws-sdk";
import { S3 } from "aws-sdk";
require("dotenv").config({ path: ".env" });
console.log(process.env.AWS_ACCESS_KEY, "key");

export const S3Init = () => {
  return new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
};
