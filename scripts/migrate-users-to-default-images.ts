/**
 * Advanced TypeScript Migration Script for Default Images
 *
 * This script provides multiple options for migrating users to default images:
 * 1. Add default image references (no Cloudinary upload)
 * 2. Dry run (show what would be changed without making changes)
 *
 * Usage:
 * npx ts-node scripts/migrate-users-to-default-images.ts [options]
 * yarn ts-node scripts/migrate-users-to-default-images.ts [options]
 *
 * Options:
 * --dry-run          Show what would be changed without making changes
 * --help             Show this help message
 */

import mongoose, { Document, Schema } from 'mongoose';
import { getDefaultImageData } from '../src/core/config/default-images.config';

// Check if we're in dry-run mode
const isDryRun = process.argv.includes('--dry-run');

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

async function migrateUsersToDefaultImages(): Promise<void> {
  try {
    console.log('🚀 Starting default images migration...\n');

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://peter:nuspring@schoo-manager.yjmzrjx.mongodb.net/nuspring-logistics?retryWrites=true&w=majority&appName=Nuspring-20Logistics-20database';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find users without images
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

    // Show what will be changed
    console.log('\n📋 Users that will be updated:');
    usersWithoutImages.forEach((user, index) => {
      const needsProfile = !user.profilePicture;
      const needsBackground = !user.backgroundImage;

      console.log(`   ${index + 1}. ${user.email}`);
      if (needsProfile) console.log(`      📸 Will add profile picture`);
      if (needsBackground) console.log(`      🖼️  Will add background image`);
    });

    if (isDryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes were made');
      console.log(`   Would update ${usersWithoutImages.length} users`);
      return;
    }

    // Confirm before proceeding
    console.log('\n⚠️  About to update users with default images...');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Process users
    let updated = 0;
    let errors = 0;

    for (const user of usersWithoutImages) {
      try {
        const updateData: Partial<IUser> = {};

        // Add default profile picture if missing
        if (!user.profilePicture) {
          updateData.profilePicture = getDefaultImageData('profilePicture');
        }

        // Add default background image if missing
        if (!user.backgroundImage) {
          updateData.backgroundImage = getDefaultImageData('backgroundImage');
        }

        // Update user
        if (Object.keys(updateData).length > 0) {
          await User.findByIdAndUpdate(user._id, updateData);
          updated++;
          console.log(`✅ Updated ${user.email}`);
        }
      } catch (error) {
        console.error(
          `❌ Error updating ${user.email}:`,
          (error as Error).message,
        );
        errors++;
      }
    }

    console.log('\n📈 Migration Results:');
    console.log(`   Users updated: ${updated}`);
    console.log(`   Errors: ${errors}`);

    // Verify results
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
        `\n⚠️  ${usersStillWithoutImages.length} users still don't have images.`,
      );
    }
  } catch (error) {
    console.error('💥 Migration failed:', (error as Error).message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Helper function to show usage
function showUsage(): void {
  console.log(`
📋 Default Images Migration Script (TypeScript)

This script migrates existing users to have default profile pictures and background images.

🔧 Usage:
  npx ts-node scripts/migrate-users-to-default-images.ts [options]
  yarn ts-node scripts/migrate-users-to-default-images.ts [options]

📝 Options:
  --dry-run          Show what would be changed without making changes
  --help             Show this help message

🔧 Setup:
1. Set MONGODB_URI environment variable
2. Ensure default images configuration is properly set up
3. Run the script

📊 What it does:
- Finds users without profilePicture or backgroundImage
- Adds default image references to those users
- Reports migration results
- Handles errors gracefully

⚠️  Note: Make sure your default image URLs are working before running!
`);
}

// Check for help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the migration
migrateUsersToDefaultImages().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
