/**
 * Default Images Configuration
 *
 * This file contains the default image URLs for users who haven't uploaded
 * their own profile pictures or background images.
 *
 * To use the Freepik images you mentioned:
 * 1. Download the images from the provided links
 * 2. Upload them to your Cloudinary account
 * 3. Replace the placeholder URLs below with your Cloudinary URLs
 */

export const DEFAULT_IMAGES = {
  // Default profile picture URL
  // Replace with your Cloudinary URL after uploading the avatar image
  PROFILE_PICTURE:
    'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/defaults/default-profile-avatar.jpg',

  // Default background image URL
  // Replace with your Cloudinary URL after uploading the background image
  BACKGROUND_IMAGE:
    'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/defaults/default-background.jpg',

  // Alternative: You can also use external URLs if you have the rights
  // PROFILE_PICTURE: 'https://example.com/path/to/default-avatar.jpg',
  // BACKGROUND_IMAGE: 'https://example.com/path/to/default-background.jpg',
} as const;

/**
 * Helper function to get default image data
 */
export function getDefaultImageData(
  imageType: 'profilePicture' | 'backgroundImage',
) {
  const url =
    imageType === 'profilePicture'
      ? DEFAULT_IMAGES.PROFILE_PICTURE
      : DEFAULT_IMAGES.BACKGROUND_IMAGE;

  return {
    public_id: `default-${imageType}`,
    url,
    width: 400,
    height: 400,
    format: 'jpg',
    size: 0,
    uploadedAt: new Date(),
    isDefault: true, // Flag to identify default images
  };
}

/**
 * Check if an image is a default image
 */
export function isDefaultImage(imageData: any): boolean {
  return (
    imageData?.isDefault === true ||
    imageData?.public_id?.startsWith('default-')
  );
}

