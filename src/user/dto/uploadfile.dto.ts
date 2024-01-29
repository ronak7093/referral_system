import { IsString } from "class-validator";

export class UploadFileDto {
  @IsString()
  originalName: String;

  //   @IsString()
  //   file: string;
}
