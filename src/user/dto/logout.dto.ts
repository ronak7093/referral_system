import { IsString } from "class-validator";

export class ILogoutDto {
  @IsString()
  deviceId: string;
}
