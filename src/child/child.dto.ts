import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChildApiDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export type CreateChildDto = {
  name: string;
  parentId: string;
};

export type EditChildDto = {
  id: string;
  name: string;
};
