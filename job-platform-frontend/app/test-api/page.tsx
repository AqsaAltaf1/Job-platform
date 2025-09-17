'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TestAPIPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        
        // Test jobs API
        const jobsData = await api.jobs.getJobs() as any[];
        setJobs(jobsData);
        
        // Test companies API
        const companiesData = await api.companies.getCompanies() as any[];
        setCompanies(companiesData);
        
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'API connection failed');
        console.error('API Test Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Testing API Connection...</h1>
        <p>Loading data from backend...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Frontend is connected to backend API
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Jobs from Backend ({jobs.length})</h2>
          <div className="space-y-2">
            {jobs.map((job: any) => (
              <div key={job.id} className="p-3 border rounded">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company.name}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Companies from Backend ({companies.length})</h2>
          <div className="space-y-2">
            {companies.map((company: any) => (
              <div key={company.id} className="p-3 border rounded">
                <h3 className="font-medium">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.industry}</p>
                <p className="text-sm text-gray-500">{company.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
