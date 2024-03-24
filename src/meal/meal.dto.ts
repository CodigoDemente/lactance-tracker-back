import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DateTime } from 'luxon';

class CreateEditMealAPIDto {
  @Transform(({ value }) => DateTime.fromISO(value).toUTC())
  @IsOptional()
  date?: DateTime;
}

export class CreateMealAPIDto extends CreateEditMealAPIDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['breast', 'bottle'])
  type: string;
}

export class EditMealAPIDto extends CreateEditMealAPIDto {
  @IsString()
  @IsOptional()
  @IsEnum(['breast', 'bottle'])
  type?: string;
}

export type CreateMealDto = {
  childId: string;
  type: string;
  date?: DateTime;
};

export type EditMealDto = {
  id: string;
  type?: string;
  date?: DateTime;
};
