import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/temp';

      // Create directory if it doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      // Use fieldname if available, otherwise use 'file'
      const fieldName = file.fieldname || 'file';
      cb(null, `${fieldName}-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Check if file exists and has originalname
    if (!file || !file.originalname) {
      return cb(new Error('Invalid file or missing file name'), false);
    }

    // Check file type
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }

    // Check file size (10MB limit) - only if file.size is available
    if (file.size && file.size > 10 * 1024 * 1024) {
      return cb(new Error('File size too large! Maximum size is 10MB.'), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Maximum 10 files
  },
};

export const vehicleImageUpload = {
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 10, // Allow up to 10 images per vehicle
  },
};

export const productImageUpload = {
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
    files: 10, // Allow up to 10 images per product
  },
};
