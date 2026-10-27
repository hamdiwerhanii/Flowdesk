import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  /** The `token` query parameter from the emailed link. */
  @IsString()
  @MaxLength(200)
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
