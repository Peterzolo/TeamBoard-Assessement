/**
 * TypeScript Migration Script to add default images to existing users
 *
 * This script will:
 * 1. Find all users without profilePicture or backgroundImage
 * 2. Add default images to those users
 * 3. Report the results
 *
 * Usage:
 * npx ts-node scripts/add-default-images-to-existing-users.ts
 * or
 * yarn ts-node scripts/add-default-images-to-existing-users.ts
 */

import mongoose, { Document, Schema } from 'mongoose';
import { getDefaultImageData } from '../src/core/config/default-images.config';

// Define the User interface
interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: string;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  profilePicture?: {
    public_id: string;
    url: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    uploadedAt?: Date;
    isDefault?: boolean;
  };
  backgroundImage?: {
    public_id: string;
    url: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    uploadedAt?: Date;
    isDefault?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    phoneNumber: String,
    city: String,
    state: String,
    country: String,
    password: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: { type: String, required: true },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: Date,
    profilePicture: {
      type: Object,
      required: false,
    },
    backgroundImage: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>('User', userSchema);

async function addDefaultImagesToExistingUsers(): Promise<void> {
  try {
    console.log('🚀 Starting default images migration for existing users...\n');

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find users without profilePicture or backgroundImage
    const usersWithoutImages = await User.find({
      $or: [
        { profilePicture: { $exists: false } },
        { profilePicture: null },
        { backgroundImage: { $exists: false } },
        { backgroundImage: null },
      ],
    });

    console.log(`📊 Found ${usersWithoutImages.length} users without images`);

    if (usersWithoutImages.length === 0) {
      console.log('🎉 All users already have images! No migration needed.');
      return;
    }

    // Process users in batches
    const batchSize = 100;
    let processed = 0;
    let updated = 0;

    for (let i = 0; i < usersWithoutImages.length; i += batchSize) {
      const batch = usersWithoutImages.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersWithoutImages.length / batchSize)}`,
      );
      console.log(
        `   Users ${i + 1} to ${Math.min(i + batchSize, usersWithoutImages.length)}`,
      );

      for (const user of batch) {
        try {
          const updateData: Partial<IUser> = {};

          // Add default profile picture if missing
          if (!user.profilePicture) {
            updateData.profilePicture = getDefaultImageData('profilePicture');
            console.log(
              `   📸 Adding default profile picture to ${user.email}`,
            );
          }

          // Add default background image if missing
          if (!user.backgroundImage) {
            updateData.backgroundImage = getDefaultImageData('backgroundImage');
            console.log(
              `   🖼️  Adding default background image to ${user.email}`,
            );
          }

          // Update user if there are changes
          if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(user._id, updateData);
            updated++;
          }

          processed++;
        } catch (error) {
          console.error(
            `   ❌ Error updating user ${user.email}:`,
            (error as Error).message,
          );
        }
      }
    }

    console.log('\n📈 Migration Results:');
    console.log(`   Total users processed: ${processed}`);
    console.log(`   Users updated: ${updated}`);
    console.log(`   Users skipped: ${processed - updated}`);

    // Verify the results
    const usersStillWithoutImages = await User.find({
      $or: [
        { profilePicture: { $exists: false } },
        { profilePicture: null },
        { backgroundImage: { $exists: false } },
        { backgroundImage: null },
      ],
    });

    if (usersStillWithoutImages.length === 0) {
      console.log(
        '\n🎉 Migration completed successfully! All users now have default images.',
      );
    } else {
      console.log(
        `\n⚠️  ${usersStillWithoutImages.length} users still don't have images. Check for errors above.`,
      );
    }
  } catch (error) {
    console.error('💥 Migration failed:', (error as Error).message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Helper function to show usage
function showUsage(): void {
  console.log(`
📋 Default Images Migration Script (TypeScript)

This script adds default profile pictures and background images to existing users who don't have them.

🔧 Setup:
1. Make sure your MongoDB connection string is set in MONGODB_URI environment variable
2. Ensure the default images configuration is properly set up
3. Run: npx ts-node scripts/add-default-images-to-existing-users.ts
   or: yarn ts-node scripts/add-default-images-to-existing-users.ts

📝 What it does:
- Finds users without profilePicture or backgroundImage
- Adds default images to those users
- Reports the migration results
- Handles errors gracefully

⚠️  Note: This script only adds default images (no Cloudinary uploads).
Make sure your default image URLs are working before running this script.
`);
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the migration
addDefaultImagesToExistingUsers().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
