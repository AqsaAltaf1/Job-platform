# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the job platform.

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### Step 2: Create OAuth 2.0 Credentials
1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
5. Copy the Client ID and Client Secret

## 2. Environment Variables

### Backend Environment Variables
Add these to your backend `.env` file:

```env
# Google OAuth Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### Frontend Environment Variables
Add these to your frontend `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://job-platform-backend-jhq7.onrender.com/api
NEXT_PUBLIC_FRONTEND_URL=https://job-platform-zsyc-kvxkwi10c-aqsaaltafs-projects.vercel.app

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 3. Database Migration

Run the database migration to add Google OAuth support:

```bash
cd job-portal-backend
psql -h localhost -U job -d job -f migrations/037_add_google_id_to_users.sql
```

## 4. Testing Google OAuth

### Local Development
1. Start the backend server: `npm start`
2. Start the frontend: `npm run dev`
3. Go to the login page
4. Click "Continue with Google"
5. Complete the OAuth flow

### Production Deployment
1. Update the redirect URI in Google Cloud Console to your production domain
2. Update environment variables with production URLs
3. Deploy both frontend and backend

## 5. Features

### What Google OAuth Provides
- **Automatic Account Creation**: New users are automatically registered
- **Email Verification**: Google emails are pre-verified
- **Profile Information**: Name and profile picture from Google
- **Secure Authentication**: No password required

### User Flow
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Redirected back to application
5. Account created (if new) or logged in (if existing)
6. Redirected to appropriate dashboard

## 6. Security Considerations

- **State Parameter**: CSRF protection using state parameter
- **Token Validation**: Access tokens are validated with Google
- **Secure Storage**: JWT tokens stored securely
- **Email Verification**: Google emails are trusted as verified

## 7. Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check that the redirect URI in Google Cloud Console matches exactly
- Ensure no trailing slashes or extra characters

**"Client ID not found"**
- Verify the Google Client ID is correctly set in environment variables
- Check that the OAuth consent screen is configured

**"Access denied"**
- User may have denied permissions
- Check OAuth consent screen configuration

**"Token exchange failed"**
- Verify Google Client Secret is correct
- Check that the authorization code hasn't expired

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 8. API Endpoints

The following endpoints are available for Google OAuth:

- `POST /api/auth/google/token` - Exchange code for access token
- `POST /api/auth/google/profile` - Fetch Google profile
- `POST /api/auth/google/authenticate` - Authenticate user with Google

## 9. Frontend Components

### Login Form
The login form now includes a Google login button with:
- Google branding and colors
- Loading states
- Error handling
- Responsive design

### Callback Page
The callback page handles:
- Authorization code exchange
- User authentication
- Error handling
- Automatic redirection

## 10. Database Schema

New fields added to the `users` table:
- `google_id` - Google user ID (unique)
- `email_verified` - Email verification status

These fields allow for:
- Linking Google accounts to existing users
- Tracking email verification status
- Preventing duplicate accounts

