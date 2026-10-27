import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MaxLength(200)
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
