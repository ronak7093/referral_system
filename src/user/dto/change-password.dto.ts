import { IsString } from "class-validator";

export class IChangePasswordDto {
  @IsString()
  old_password: string;

  @IsString()
  new_password: string;

  @IsString()
  confirm_Password: String;
}
