import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 10_000)
  body: string;

  /** Staff only: a note customers never see. */
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
