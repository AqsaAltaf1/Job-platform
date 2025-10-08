// Simple API client to connect frontend with backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch function
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Jobs API
export const jobsAPI = {
  getJobs: () => fetchAPI('/jobs'),
  getJob: (id: string) => fetchAPI(`/jobs/${id}`),
};

// Companies API
export const companiesAPI = {
  getCompanies: () => fetchAPI('/companies'),
};

// Export all APIs
export const api = {
  jobs: jobsAPI,
  companies: companiesAPI,
};
