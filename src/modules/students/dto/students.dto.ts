import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class FindStudentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6,12}$/, {
    message: 'SBD must be a numeric string between 6 and 12 digits',
  })
  sbd: string;
}
