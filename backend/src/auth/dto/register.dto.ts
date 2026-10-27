import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

/** Customer self-signup into an existing organization (needs admin approval). */
export class RegisterDto {
  @IsString()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @Matches(/^[a-z0-9-]+$/, { message: 'Invalid organization slug' })
  orgSlug: string;

  @IsString()
  @Length(2, 80)
  name: string;

  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
