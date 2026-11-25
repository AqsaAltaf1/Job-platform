# LinkedIn Integration Setup

This document explains how to set up LinkedIn OAuth integration for importing candidate skills.

## Prerequisites

1. LinkedIn Developer Account
2. LinkedIn App created in LinkedIn Developer Portal

## LinkedIn App Configuration

### 1. Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Sign in with your LinkedIn account
3. Click "Create App"
4. Fill in the required information:
   - App name: "Job Platform Skills Import"
   - LinkedIn Page: Select your company page
   - Privacy policy URL: Your privacy policy URL
   - App logo: Upload a logo

### 2. Configure OAuth Settings

1. In your LinkedIn app, go to "Auth" tab
2. Add redirect URL: `http://localhost:3000/auth/linkedin/callback` (for development)
3. For production, add: `https://yourdomain.com/auth/linkedin/callback`
4. Request the following scopes:
   - `r_liteprofile` - Basic profile information (name, profile picture)
   
   **Note:** 
   - `r_emailaddress` scope requires special approval from LinkedIn and is not available for most applications
   - `r_skills` scope also requires special approval and is not available for most applications
   - The current implementation works with basic profile only

### 3. Get API Credentials

1. In your LinkedIn app, go to "Auth" tab
2. Copy the "Client ID" and "Client Secret"
3. These will be used in your environment variables

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
```

### Backend (.env)

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

## Installation

### 1. Install Dependencies

```bash
# Backend
cd job-portal-backend
npm install axios

# Frontend (already included)
cd job-platform-frontend
npm install
```

### 2. Database Migration

The LinkedIn integration uses the existing `enhanced_skills` table with these additional fields:
- `taxonomy_source` - Set to 'linkedin' for imported skills
- `verified` - Set to true for LinkedIn skills
- `skill_rating` - Endorsement count from LinkedIn

No additional migration is required.

## Usage

### For Candidates

1. Go to Profile → Skills tab
2. Click "Connect LinkedIn" button
3. Authorize the app on LinkedIn
4. Preview your LinkedIn skills
5. Click "Import All Skills" to add them to your profile

### Features

- **Automatic Skill Import**: Fetches all skills from LinkedIn profile
- **Endorsement Count**: Preserves LinkedIn endorsement numbers
- **Verification**: Marks imported skills as verified
- **Duplicate Handling**: Updates existing skills or creates new ones
- **Batch Processing**: Imports all skills at once

## API Endpoints

### POST /api/auth/linkedin/token
Exchange authorization code for access token

### POST /api/auth/linkedin/profile
Fetch LinkedIn profile and skills data

### POST /api/auth/linkedin/import-skills
Import LinkedIn skills to candidate profile

## Security Considerations

1. **Access Token Storage**: Tokens are stored in localStorage (consider more secure storage for production)
2. **Token Expiration**: LinkedIn tokens expire after 60 days
3. **Rate Limiting**: LinkedIn API has rate limits
4. **Data Privacy**: Only fetch necessary data (profile and skills)

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure redirect URI matches exactly in LinkedIn app settings
2. **"Insufficient permissions"**: Check that all required scopes are approved
3. **"Token expired"**: User needs to re-authenticate
4. **"API rate limit"**: Wait before making more requests

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=linkedin:*
```

## Production Deployment

1. Update redirect URIs in LinkedIn app to production URLs
2. Use secure token storage (consider server-side sessions)
3. Implement proper error handling and user feedback
4. Add rate limiting and caching
5. Update environment variables for production

## LinkedIn API Limitations

- **Skills API**: Requires special approval from LinkedIn (not available for most apps)
- **Email API**: Requires special approval from LinkedIn (not available for most apps)
- **Rate Limits**: 100 requests per day per user
- **Data Access**: Only public profile data
- **Token Expiry**: 60 days maximum

## LinkedIn App Approval Process

To get access to additional scopes like `r_skills` and `r_emailaddress`:

1. **Apply for Partner Program**: LinkedIn requires apps to be part of their Partner Program
2. **Business Justification**: You need to provide a business case for why you need access to skills/email data
3. **Review Process**: LinkedIn reviews applications and may approve or deny based on their criteria
4. **Alternative**: Use basic profile data only (current implementation)

## Current Implementation

The current system works with:
- ✅ **Basic Profile**: Name, profile picture, LinkedIn ID
- ❌ **Skills Data**: Not available without special approval
- ❌ **Email Address**: Not available without special approval

This means users can connect their LinkedIn account, but skills import will not be available until LinkedIn approves additional scopes.

## Support

For LinkedIn API issues, refer to:
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [LinkedIn Developer Support](https://developer.linkedin.com/support)
