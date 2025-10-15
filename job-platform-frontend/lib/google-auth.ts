// Google OAuth Integration
export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
  locale?: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  scope: string;
}

class GoogleAuthService {
  private clientId: string;
  private scope: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    this.scope = 'openid email profile';
  }

  private getRedirectUri(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/google/callback`;
    }
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;
  }

  // Generate Google OAuth URL
  getAuthUrl(): string {
    const state = Math.random().toString(36).substring(7);
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_state', state);
    }
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      state: state,
      scope: this.scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<GoogleAuthResponse> {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('google_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  // Fetch Google profile
  async fetchProfile(accessToken: string): Promise<GoogleProfile> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google profile');
      }

      const profileData = await response.json();
      return profileData;
    } catch (error) {
      console.error('Error fetching Google profile:', error);
      throw error;
    }
  }

  // Authenticate with Google (login or register)
  async authenticateWithGoogle(accessToken: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Google');
      }

      return response.json();
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      throw error;
    }
  }

  // Get stored access token
  getStoredAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('google_access_token');
    }
    return null;
  }

  // Store access token
  storeAccessToken(token: string, expiresIn: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_access_token', token);
      localStorage.setItem('google_token_expires', 
        (Date.now() + expiresIn * 1000).toString()
      );
    }
  }

  // Clear stored tokens
  clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expires');
      localStorage.removeItem('google_state');
    }
  }
}

export const googleAuth = new GoogleAuthService();


