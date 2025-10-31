# TeamBoard API - Postman Collection

This folder contains the Postman collection and environment files for testing the TeamBoard API.

## 📦 Files Included

- **TeamBoard-API.postman_collection.json** - Complete API collection with all endpoints
- **TeamBoard-API.postman_environment.json** - Environment variables template

## 🚀 Quick Start

### Option 1: Import via Postman App

1. **Open Postman Desktop App**
2. Click **Import** button (top left)
3. Drag and drop `TeamBoard-API.postman_collection.json` or click "Upload Files"
4. Drag and drop `TeamBoard-API.postman_environment.json` (optional but recommended)
5. Click **Import**

### Option 2: Import via Web

1. Go to [Postman Web](https://web.postman.com)
2. Click **Import** button
3. Upload the collection and environment files
4. Select the environment from the dropdown (top right)

### Option 3: Import via Link (See Sharing Section Below)

## ⚙️ Setup Environment Variables

1. After importing, click on the environment dropdown (top right)
2. Select **TeamBoard API Environment**
3. Configure the following variables:
   - **baseUrl**: `http://localhost:5000/api/v1` (or your server URL)
   - **accessToken**: (Auto-populated after login)
   - **refreshToken**: (Auto-populated after login)

## 🔐 Authentication

The collection uses **Bearer Token** authentication. Follow these steps:

1. **Login First**: Use the "Login" endpoint under "Authentication" folder
2. **Auto Token Setting**: The collection automatically saves your tokens after successful login
3. **Use Authenticated Endpoints**: All other endpoints will automatically use the saved token

### Manual Token Setup

If you prefer to set tokens manually:
1. Select the environment from dropdown
2. Edit the environment variables
3. Set `accessToken` to your JWT token
4. Save the environment

## 📋 Collection Structure

The collection is organized into the following folders:

### Health
- Basic and detailed health check endpoints

### Authentication
- Login, Logout, Refresh Token
- Email Verification
- Password Reset Flow

### Users
- User CRUD operations
- User Invitation
- Profile Completion

### Teams
- Team management endpoints

### Projects
- Project CRUD operations
- Project member management

### Tasks
- Task CRUD operations
- Task assignment
- Task reviews
- Status and priority management

### Notifications
- Notification creation (single and bulk)
- Notification retrieval
- Mark as read functionality
- Notification statistics

## 🎯 Usage Tips

1. **Start with Login**: Always login first to get your access token
2. **Check Health**: Verify the API is running using the health check endpoint
3. **Use Variables**: Replace placeholders like `USER_ID_HERE` with actual IDs from previous responses
4. **Environment Switch**: Switch between local, staging, and production environments easily

## 📤 Sharing the Collection

### Method 1: Share via Postman Cloud (Recommended)

1. **Publish to Postman Cloud**:
   - Open the collection in Postman
   - Click the **...** menu next to the collection name
   - Select **Share Collection**
   - Choose **Share via link** or **Share via workspace**
   - Copy the generated link

2. **Share the Link**:
   - Team members can import the collection directly using the link
   - The link stays in sync with updates

3. **Create a Public Workspace** (Optional):
   - Create a Postman workspace
   - Upload the collection to the workspace
   - Invite team members or make it public
   - Share the workspace link

### Method 2: Share via GitHub/GitLab

1. **Commit to Repository**:
   ```bash
   git add postman/
   git commit -m "Add Postman API collection"
   git push
   ```

2. **Team Members Import**:
   - Clone/pull the repository
   - Import files via Postman as described in Quick Start

### Method 3: Export and Email

1. **Export Collection**:
   - Right-click collection → **Export**
   - Save the file
   - Share via email or team chat

2. **Recipients Import**:
   - Import the received file in Postman

## 🔗 Generate Shareable Link

### Using Postman CLI

```bash
# Install Postman CLI
npm install -g newman

# Publish collection (requires Postman API key)
postman collection publish TeamBoard-API.postman_collection.json
```

### Using Postman API

```bash
# Get your Postman API key from https://postman.com/settings/me/api-keys

# Upload collection
curl -X POST \
  'https://api.getpostman.com/collections' \
  -H 'X-Api-Key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d @TeamBoard-API.postman_collection.json
```

### Manual Upload to Postman

1. Go to [Postman Web](https://web.postman.com)
2. Click **Import** → **Link** tab
3. If you have a link, paste it here
4. Or create a new collection and upload the JSON file
5. Click **Share** → **Get Link** to generate a shareable URL

## 🏢 For Team Collaboration

### Best Practice: Postman Workspace

1. **Create a Team Workspace**:
   - Open Postman → **Workspaces** → **Create Workspace**
   - Choose **Team** workspace
   - Invite team members

2. **Upload Collection**:
   - Import the collection to the workspace
   - Set up environments (Development, Staging, Production)

3. **Team Access**:
   - All team members automatically have access
   - Updates sync in real-time
   - Comments and discussions available

## 📝 Collection Features

- ✅ **Auto Token Management**: Login endpoint automatically saves tokens
- ✅ **Organized Folders**: All endpoints organized by feature
- ✅ **Request Examples**: Pre-filled example requests
- ✅ **Variable Support**: Easy environment switching
- ✅ **Bearer Token Auth**: Automatic authentication for protected endpoints
- ✅ **Documentation**: Each endpoint includes description

## 🔄 Updating the Collection

When API changes are made:

1. **Update the JSON file** with new endpoints
2. **Re-import** or **sync** in Postman
3. **Re-share** with team members
4. Or **update the shared link** in Postman Cloud

## 🆘 Troubleshooting

### Token Not Working
- Check if token expired (try login again)
- Verify environment is selected
- Ensure token format is correct

### 401 Unauthorized
- Login again to get a fresh token
- Check if endpoint requires authentication
- Verify token in environment variables

### 404 Not Found
- Check baseUrl is correct
- Verify endpoint path matches server routes
- Ensure server is running

### CORS Issues
- Ensure CORS is configured on server
- Check allowed origins include your domain

## 📞 Support

For API-related issues:
- Check the main README.md for API documentation
- Review server logs for error details
- Contact the development team

---

**Last Updated**: January 2024  
**API Version**: v1  
**Postman Collection Version**: 1.0.0

