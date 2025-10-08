# Frontend Environment Setup

## Required Environment Variables

Create a `.env.local` file in the frontend root directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Third-party API Keys
NEXT_PUBLIC_VERIFF_API_KEY=your_veriff_api_key_here
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
```

## For Production Deployment

Update the URLs for your production environment:

```bash
# Production URLs
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
```

## Current Status

❌ **No environment file found** - Frontend is using hardcoded localhost URLs
❌ **Missing API keys** - Veriff and LinkedIn integration won't work
✅ **Fallback URLs configured** - App will work locally without env file

## Environment Variables Used

1. `NEXT_PUBLIC_API_URL` - Backend API endpoint
2. `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL for OAuth callbacks
3. `NEXT_PUBLIC_VERIFF_API_KEY` - Veriff verification service API key
4. `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID

## Next Steps

1. Create `.env.local` file with your actual values
2. Update backend `config.env` to match frontend URLs
3. Add API keys for third-party services
4. Deploy with production URLs
