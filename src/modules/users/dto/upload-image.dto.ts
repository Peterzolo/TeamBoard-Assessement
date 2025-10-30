import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ImageType {
  PROFILE_PICTURE = 'profile-picture',
  BACKGROUND_IMAGE = 'background-image',
}

export class UploadImageDto {
  @IsEnum(ImageType)
  imageType: ImageType;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ImageUploadResponseDto {
  message: string;

  image: {
    public_id: string;
    url: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    uploadedAt: Date;
  };

  user: any;
}
