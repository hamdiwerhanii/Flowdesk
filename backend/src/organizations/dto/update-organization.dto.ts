import { IsString, Length } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @Length(2, 80)
  name: string;
}
