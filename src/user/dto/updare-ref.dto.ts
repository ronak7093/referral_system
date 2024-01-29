import { IsString } from "class-validator";

export class UpdateReferralsDto {
  // @IsNumber()
  dealValue: number;

  @IsString()
  status: string;

  @IsString()
  note: string;
}
