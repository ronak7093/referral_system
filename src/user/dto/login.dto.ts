import { IsString, IsEmail } from "class-validator";

export class ISignInDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  //   @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @IsString()
  deviceId: string;
}
