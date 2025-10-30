import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'vehicles',
  ): Promise<any> {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'auto' as const,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      };

      let result;
      if (file.path) {
        // File from disk storage
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else if (file.buffer) {
        // File from memory storage (FormData/multipart)
        result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(file.buffer);
        });
      } else {
        throw new Error('File must have either path or buffer property');
      }

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'vehicles',
  ): Promise<any[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file, folder),
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to upload multiple images: ${error.message}`);
    }
  }

  // New method specifically for service request images
  async uploadServiceRequestImages(
    files: Express.Multer.File[],
    serviceType: string,
    serviceRequestId: string,
    imageType: string,
  ): Promise<any[]> {
    try {
      // Sanitize serviceType for Cloudinary public_id (remove special characters)
      const sanitizedServiceType = serviceType
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9-]/g, '');
      
      const folder = `service-requests/${sanitizedServiceType}/${serviceRequestId}/${imageType}`;
      
      const uploadPromises = files.map(async (file) => {
        // Handle both file.path (from multer disk storage) and file.buffer (from memory storage)
        const uploadOptions = {
          folder,
          resource_type: 'auto' as const,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Higher quality for service requests
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          tags: [`service-request-${serviceRequestId}`, imageType, serviceType],
        };

        let result;
        if (file.path) {
          // File from disk storage
          result = await cloudinary.uploader.upload(file.path, uploadOptions);
        } else if (file.buffer) {
          // File from memory storage (FormData)
          result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }).end(file.buffer);
          });
        } else {
          throw new Error('File must have either path or buffer property');
        }

        return {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          folder,
          imageType,
          uploadedAt: new Date(),
        };
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to upload service request images: ${error.message}`);
    }
  }

  // Method to upload a single service request image
  async uploadServiceRequestImage(
    file: Express.Multer.File,
    serviceType: string,
    serviceRequestId: string,
    imageType: string,
  ): Promise<any> {
    try {
      // Sanitize serviceType for Cloudinary public_id (remove special characters)
      const sanitizedServiceType = serviceType
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9-]/g, '');
      
      const folder = `service-requests/${sanitizedServiceType}/${serviceRequestId}/${imageType}`;
      
        const uploadOptions = {
          folder,
          resource_type: 'auto' as const,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          tags: [`service-request-${serviceRequestId}`, imageType, serviceType],
        };

      let result;
      if (file.path) {
        // File from disk storage
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else if (file.buffer) {
        // File from memory storage (FormData)
        result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(file.buffer);
        });
      } else {
        throw new Error('File must have either path or buffer property');
      }

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        folder,
        imageType,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to upload service request image: ${error.message}`);
    }
  }

  // Method to delete service request images
  async deleteServiceRequestImages(publicIds: string[]): Promise<any[]> {
    try {
      const deletePromises = publicIds.map((publicId) =>
        this.deleteImage(publicId),
      );
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to delete service request images: ${error.message}`);
    }
  }

  // Method to get optimized image URLs for different use cases
  generateServiceRequestImageUrl(publicId: string, options: any = {}): string {
    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
    };

    const transformationOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, transformationOptions);
  }

  // Method to get thumbnail URLs for image galleries
  generateThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 200,
      height: 150,
      crop: 'fill',
      quality: 'auto:good',
    });
  }

  // Method to get medium-sized URLs for detailed views
  generateMediumUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 600,
      height: 400,
      crop: 'limit',
      quality: 'auto:good',
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteMultipleImages(publicIds: string[]): Promise<any[]> {
    try {
      const deletePromises = publicIds.map((publicId) =>
        this.deleteImage(publicId),
      );
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to delete multiple images: ${error.message}`);
    }
  }

  async updateImage(publicId: string, file: Express.Multer.File): Promise<any> {
    try {
      // Delete the old image first
      await this.deleteImage(publicId);

      // Upload the new image
      const result = await this.uploadImage(file, 'vehicles');
      return result;
    } catch (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }
  }

  async uploadImageFromBuffer(
    buffer: Buffer,
    options: any = {},
  ): Promise<any> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: options.folder || 'general',
            resource_type: (options.resource_type || 'auto') as 'auto',
            transformation: options.transformation || [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
            tags: options.tags || [],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      throw new Error(`Failed to upload image from buffer: ${error.message}`);
    }
  }

  generateImageUrl(publicId: string, options: any = {}): string {
    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto',
    };

    const transformationOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, transformationOptions);
  }

  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }
}
