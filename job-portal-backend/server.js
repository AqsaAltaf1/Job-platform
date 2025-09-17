import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Job Portal Backend is running! 🚀' });
});

// API Routes
app.get('/api/jobs', (req, res) => {
  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      description: 'We are looking for a senior frontend developer...',
      requirements: '5+ years experience with React, TypeScript',
      salary_min: 80000,
      salary_max: 120000,
      location: 'San Francisco, CA',
      job_type: 'full-time',
      experience_level: 'senior',
      company_id: '1',
      posted_by: '1',
      status: 'published',
      created_at: new Date(),
      updated_at: new Date(),
      company: {
        id: '1',
        name: 'TechCorp',
        description: 'Leading technology company',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: '100-500',
        location: 'San Francisco, CA'
      }
    },
    {
      id: '2',
      title: 'Backend Developer',
      description: 'Join our backend team...',
      requirements: '3+ years with Node.js, PostgreSQL',
      salary_min: 70000,
      salary_max: 100000,
      location: 'Remote',
      job_type: 'full-time',
      experience_level: 'mid',
      company_id: '2',
      posted_by: '2',
      status: 'published',
      created_at: new Date(),
      updated_at: new Date(),
      company: {
        id: '2',
        name: 'StartupXYZ',
        description: 'Innovative startup',
        website: 'https://startupxyz.com',
        industry: 'Technology',
        size: '10-50',
        location: 'New York, NY'
      }
    }
  ];
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = {
    id: id,
    title: 'Senior Frontend Developer',
    description: 'We are looking for a senior frontend developer...',
    requirements: '5+ years experience with React, TypeScript',
    salary_min: 80000,
    salary_max: 120000,
    location: 'San Francisco, CA',
    job_type: 'full-time',
    experience_level: 'senior',
    company_id: '1',
    posted_by: '1',
    status: 'published',
    created_at: new Date(),
    updated_at: new Date(),
    company: {
      id: '1',
      name: 'TechCorp',
      description: 'Leading technology company',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: '100-500',
      location: 'San Francisco, CA'
    }
  };
  res.json(job);
});

app.get('/api/companies', (req, res) => {
  const companies = [
    {
      id: '1',
      name: 'TechCorp',
      description: 'Leading technology company',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: '100-500',
      location: 'San Francisco, CA',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      name: 'StartupXYZ',
      description: 'Innovative startup',
      website: 'https://startupxyz.com',
      industry: 'Technology',
      size: '10-50',
      location: 'New York, NY',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  res.json(companies);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
