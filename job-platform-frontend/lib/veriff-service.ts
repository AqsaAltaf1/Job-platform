// Dynamic import for SSR safety

export interface VeriffSessionData {
  sessionId: string;
  sessionUrl: string;
  sessionToken: string;
}

export interface VeriffUserData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD format
  country?: string;
}

class VeriffService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Create a verification session
   */
  async createVerificationSession(userData: VeriffUserData): Promise<{
    success: boolean;
    data?: VeriffSessionData;
    error?: string;
  }> {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.apiBaseUrl}/verification/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: {
            sessionId: result.sessionId,
            sessionUrl: result.sessionUrl,
            sessionToken: result.sessionToken,
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create verification session'
        };
      }
    } catch (error) {
      console.error('Veriff session creation error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Launch Veriff verification flow
   */
  async launchVerification(userData: VeriffUserData): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Verification can only be started in the browser'
        };
      }

      // Check if Veriff SDK is loaded
      console.log('Checking Veriff SDK...');
      console.log('window.Veriff:', typeof (window as any).Veriff);
      console.log('API Key:', process.env.NEXT_PUBLIC_VERIFF_API_KEY);
      
      if (typeof (window as any).Veriff === 'undefined') {
        console.error('Veriff SDK not loaded');
        return {
          success: false,
          error: 'Veriff SDK not loaded. Please refresh the page and try again.'
        };
      }

      // Initialize Veriff SDK using the CDN version
      const veriff = (window as any).Veriff({
        host: 'https://stationapi.veriff.com',
        apiKey: process.env.NEXT_PUBLIC_VERIFF_API_KEY || '',
        parentId: 'veriff-root',
        onSession: (err: any, response: any) => {
          if (err) {
            console.error('Veriff session error:', err);
            return;
          }
          console.log('Veriff session response:', response);
          // Open the verification URL in a new window
          const verificationWindow = window.open(
            response.verification.url, 
            'veriff-verification', 
            'width=800,height=600,scrollbars=yes,resizable=yes'
          );
          
          if (!verificationWindow) {
            console.error('Popup blocked! Please allow popups for this site.');
            alert('Popup blocked! Please allow popups for this site and try again.');
          }
        },
        onFinished: (err: any, response: any) => {
          if (err) {
            console.error('Veriff verification error:', err);
            return;
          }
          console.log('Veriff verification finished:', response);
          // Handle verification completion
          this.handleVerificationComplete(response);
        },
      });

      // Mount the verification form
      veriff.mount({
        formLabel: {
          vendorData: 'User ID'
        }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Veriff launch error:', error);
      return {
        success: false,
        error: 'Failed to launch verification'
      };
    }
  }

  /**
   * Handle verification completion
   */
  private async handleVerificationComplete(response: any) {
    try {
      // You can implement custom logic here
      // For example, redirect to a success page or update UI
      console.log('Verification completed:', response);
      
      // Optionally refresh user data to get updated verification status
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error handling verification completion:', error);
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(sessionId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.apiBaseUrl}/verification/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to get verification status'
        };
      }
    } catch (error) {
      console.error('Get verification status error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Get user verification status
   */
  async getUserVerificationStatus(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.apiBaseUrl}/verification/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.verification
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to get user verification status'
        };
      }
    } catch (error) {
      console.error('Get user verification status error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }
}

export default new VeriffService();
