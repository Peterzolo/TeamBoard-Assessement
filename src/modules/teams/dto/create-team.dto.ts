import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayUnique,
  IsBoolean,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  @IsOptional()
  tasks?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsMongoId()
  @IsOptional()
  teamLeader?: string;
}
