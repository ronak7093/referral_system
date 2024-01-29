import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from "class-validator";

export class ISignUpDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  businessName: string;

  // @IsEmail({}, { message: "Please provide a valid email address" })
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: 'Invalid email format',
  })
  email: string;

  @IsNotEmpty({ message: "Please Enter a password" })
  @IsString()
  @MinLength(8, { message: "Password length must be at least 8 characters" })
  @MaxLength(60, { message: "Password length cannot exceed 60 characters" })
  password: string;

  @IsNotEmpty()
  @Matches(/^\+91[1-9]\d{9}$/, {
    message: "Invalid Indian phone number format (e.g., +919876543210)",
  })
  smsNumber: String;

  // // image
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

  @IsString()
  deviceId: string;
}
