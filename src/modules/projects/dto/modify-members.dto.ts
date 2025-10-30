import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class ModifyMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsMongoId({ each: true })
  members: string[];
}
