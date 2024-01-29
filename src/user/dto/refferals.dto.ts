import { IsString, IsEmail, IsNumber } from "class-validator";

export class ReferralsDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  phoneNumber: number;

  @IsString()
  reason: string;

  @IsString()
  role: string;
  // @IsString()
  // referralTo: String;
}
