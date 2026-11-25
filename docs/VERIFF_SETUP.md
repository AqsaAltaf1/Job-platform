# Veriff Identity Verification Setup

This document explains how to set up Veriff identity verification for the job platform.

## Prerequisites

1. Create a Veriff account at [https://magic.veriff.com](https://magic.veriff.com)
2. Create a new integration in the Veriff Customer Portal
3. Obtain your API key and shared secret key

## Backend Configuration

### Environment Variables

Add the following variables to your `job-portal-backend/config.env` file:

```env
# Veriff Identity Verification Configuration
VERIFF_API_KEY=your_veriff_api_key_here
VERIFF_SHARED_SECRET=your_veriff_shared_secret_here
VERIFF_BASE_URL=https://stationapi.veriff.com
```

### Database Migration

Run the migration to add verification fields to the users table:

```bash
cd job-portal-backend
node scripts/run-migrations.js
```

This will add the following fields to the `users` table:
- `verification_status` - Veriff verification status (PENDING, APPROVED, DECLINED, etc.)
- `verification_code` - Veriff verification code (VERIFIED, FRAUD, etc.)
- `verification_date` - Date when verification was completed

## Frontend Configuration

### Environment Variables

Add the following variables to your `job-platform-frontend/.env.local` file:

```env
# Veriff Identity Verification Configuration
NEXT_PUBLIC_VERIFF_API_KEY=your_veriff_api_key_here
```

### Dependencies

The Veriff JavaScript SDK is already installed:

```bash
npm install @veriff/js-sdk
```

## API Endpoints

The following endpoints are available for Veriff integration:

### Create Verification Session
```
POST /api/verification/create-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "country": "US"
}
```

### Get Verification Status
```
GET /api/verification/status/:sessionId
Authorization: Bearer <token>
```

### Get User Verification Status
```
GET /api/verification/user-status
Authorization: Bearer <token>
```

### Webhook Endpoint
```
POST /api/verification/webhook
```

## Usage

### Frontend Integration

1. Import the VeriffVerification component:
```tsx
import { VeriffVerification } from '@/components/verification/veriff-verification';
```

2. Use the component in your page:
```tsx
<VeriffVerification onVerificationComplete={(status) => {
  console.log('Verification completed:', status);
}} />
```

### Backend Integration

1. Import the VeriffService:
```javascript
import VeriffService from '../services/veriffService.js';
```

2. Create a verification session:
```javascript
const result = await VeriffService.createVerificationSession({
  userId: user.id,
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  country: 'US'
});
```

## Webhook Configuration

1. In your Veriff Customer Portal, configure the webhook URL:
   - URL: `https://yourdomain.com/api/verification/webhook`
   - Events: Select all verification events

2. The webhook will automatically update user verification status when verification is completed.

## Verification Flow

1. User clicks "Start Identity Verification"
2. Frontend creates a verification session via API
3. Veriff SDK launches the verification flow
4. User completes identity verification (photo, document scan, etc.)
5. Veriff processes the verification
6. Webhook receives the result and updates user status
7. User sees updated verification status

## Security Considerations

- All API requests require authentication
- Webhook signatures are verified using HMAC-SHA256
- User data is only sent to Veriff during the verification process
- Verification results are stored securely in the database

## Testing

1. Use Veriff's sandbox environment for testing
2. Test with various document types and countries
3. Verify webhook handling for different verification outcomes
4. Test error handling for network issues and invalid data

## Troubleshooting

### Common Issues

1. **"Invalid webhook signature"**
   - Check that VERIFF_SHARED_SECRET is correctly set
   - Ensure webhook URL is properly configured in Veriff portal

2. **"Failed to create verification session"**
   - Verify VERIFF_API_KEY is correct
   - Check that all required user data is provided

3. **Veriff SDK not loading**
   - Ensure NEXT_PUBLIC_VERIFF_API_KEY is set
   - Check browser console for JavaScript errors

### Support

- Veriff Documentation: [https://devdocs.veriff.com](https://devdocs.veriff.com)
- Veriff Support: Available through the Customer Portal
