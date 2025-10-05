// Configuration for API endpoints
export const config = {
  // Use environment variable for API base URL
  API_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
}

// Helper function to get full API URL
export const getApiUrl = (endpoint?: string) => {
  // Handle undefined or empty endpoint
  if (!endpoint) {
    return config.API_BASE;
  }
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${config.API_BASE}${cleanEndpoint}`;
};
