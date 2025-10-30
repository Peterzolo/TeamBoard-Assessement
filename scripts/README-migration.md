# Default Images Migration Scripts

This directory contains TypeScript scripts to migrate existing users to the new default images system.

## Scripts Available

#### 1. `add-default-images-to-existing-users.ts`
**Simple migration script** - Adds default image references to users without them.

```bash
# Using npx
npx ts-node scripts/add-default-images-to-existing-users.ts

# Using yarn
yarn ts-node scripts/add-default-images-to-existing-users.ts
```

#### 2. `migrate-users-to-default-images.ts`
**Advanced migration script** with multiple options:

```bash
# Dry run (see what would be changed)
npx ts-node scripts/migrate-users-to-default-images.ts --dry-run

# Actually migrate users
npx ts-node scripts/migrate-users-to-default-images.ts

# Show help
npx ts-node scripts/migrate-users-to-default-images.ts --help
```

## Setup Before Running

### 1. Environment Variables
Set your MongoDB connection string:
```bash
export MONGODB_URI="mongodb://localhost:27017/your-database-name"
```

### 2. Update Default Image URLs
The scripts use the default images configuration from your TypeScript config files. Make sure your `src/core/config/default-images.config.ts` has the correct Cloudinary URLs.

### 3. Run the Setup Script First
Before running the migration, make sure you've uploaded the default images to Cloudinary:

```bash
node scripts/setup-default-images.js
```

## What the Migration Does

1. **Finds users** without `profilePicture` or `backgroundImage` fields
2. **Adds default image references** to those users
3. **Reports results** showing how many users were updated
4. **Handles errors gracefully** and continues processing

## Example Output

```
🚀 Starting default images migration...

✅ Connected to MongoDB
📊 Found 150 users without images

📋 Users that will be updated:
   1. user1@example.com
      📸 Will add profile picture
      🖼️  Will add background image
   2. user2@example.com
      📸 Will add profile picture
   ...

✅ Updated user1@example.com
✅ Updated user2@example.com
...

📈 Migration Results:
   Users updated: 150
   Errors: 0

🎉 Migration completed successfully! All users now have default images.
```

## Safety Features

- **Dry run mode** - See what would be changed without making changes
- **Batch processing** - Handles large numbers of users efficiently
- **Error handling** - Continues processing even if some users fail
- **Verification** - Checks results after migration
- **Rollback safe** - Only adds missing fields, doesn't modify existing data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `MONGODB_URI` environment variable
   - Ensure MongoDB is running

2. **Default Image URLs Not Working**
   - Update the URLs in the script to point to your actual Cloudinary images
   - Run `setup-default-images.js` first to upload images

3. **Permission Errors**
   - Ensure the script has read/write access to the database
   - Check your MongoDB user permissions

### Getting Help

Run any script with `--help` to see usage information:

```bash
npx ts-node scripts/migrate-users-to-default-images.ts --help
```
