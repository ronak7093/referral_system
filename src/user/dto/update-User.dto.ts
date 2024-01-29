import { IsString, Matches } from "class-validator";

export class IUpdateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  businessName: string;

  // @IsEmail()
  // @IsString()
  // email: string;

  // @Matches(/^\+91[1-9]\d{9}$/, {
  //   message: "Invalid Indian phone number format (e.g., +919876543210)",
  // })
  smsNumber: String;

  // image
  // @IsString()
  // headShort: string;

  @IsString()
  website: string;

  @IsString()
  businessType: string;

  @IsString()
  aboutMyBusiness: string;

  @IsString()
  myPerfectClient: string;
}
