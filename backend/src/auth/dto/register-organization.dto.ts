import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

/** Creates an organization and its first admin. */
export class RegisterOrganizationDto {
  @IsString()
  @Length(2, 80)
  organizationName: string;

  @IsString()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @Length(3, 40)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Slug may contain lowercase letters, digits and single hyphens',
  })
  slug: string;

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
