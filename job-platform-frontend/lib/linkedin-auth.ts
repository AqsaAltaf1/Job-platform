// LinkedIn OAuth and Skills Integration
export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  headline?: string;
  summary?: string;
  skills: LinkedInSkill[];
}

export interface LinkedInSkill {
  name: string;
  category?: string;
  endorsements?: number;
  verified?: boolean;
}

export interface LinkedInAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class LinkedInAuthService {
  private clientId: string;
  private scope: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '';
    this.scope = 'r_liteprofile'; // Only basic profile - skills scope not authorized
  }

  private getRedirectUri(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/linkedin/callback`;
    }
    return 'http://localhost:3000/auth/linkedin/callback'; // fallback for SSR
  }

  // Generate LinkedIn OAuth URL
  getAuthUrl(): string {
    const state = Math.random().toString(36).substring(7);
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkedin_state', state);
    }
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      state: state,
      scope: this.scope
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<LinkedInAuthResponse> {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('linkedin_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
    }

    const response = await fetch('/api/auth/linkedin/token', {
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

  // Fetch LinkedIn profile and skills
  async fetchProfileAndSkills(accessToken: string): Promise<LinkedInProfile> {
    try {
      // Fetch basic profile
      const profileResponse = await fetch('/api/auth/linkedin/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }

      const profileData = await profileResponse.json();
      return profileData;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  }

  // Import skills to candidate profile
  async importSkillsToProfile(accessToken: string, candidateId: string): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
    try {
      const response = await fetch('/api/auth/linkedin/import-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, candidateId })
      });

      if (!response.ok) {
        throw new Error('Failed to import LinkedIn skills');
      }

      return response.json();
    } catch (error) {
      console.error('Error importing LinkedIn skills:', error);
      throw error;
    }
  }

  // Get stored access token
  getStoredAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('linkedin_access_token');
    }
    return null;
  }

  // Store access token
  storeAccessToken(token: string, expiresIn: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkedin_access_token', token);
      localStorage.setItem('linkedin_token_expires', 
        (Date.now() + expiresIn * 1000).toString()
      );
    }
  }
}

export const linkedinAuth = new LinkedInAuthService();
