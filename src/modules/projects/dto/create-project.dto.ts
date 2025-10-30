import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsMongoId()
  @IsOptional()
  team?: string;

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @IsMongoId()
  @IsOptional()
  projectManager?: string;

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  @IsOptional()
  tasks?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
