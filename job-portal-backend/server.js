import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import { authenticateToken, requireRole } from './middleware/auth.js';
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile
} from './controllers/userController.js';

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

// Test database connection
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      message: 'Database connected successfully! ✅',
      status: 'healthy'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed! ❌',
      error: error.message
    });
  }
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

// User Authentication Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', authenticateToken, getProfile);

// User CRUD Routes
app.get('/api/users', authenticateToken, requireRole(['super_admin']), getAllUsers);
app.get('/api/users/:id', authenticateToken, getUserById);
app.put('/api/users/:id', authenticateToken, updateUser);
app.delete('/api/users/:id', authenticateToken, requireRole(['super_admin']), deleteUser);

// Start server
app.listen(PORT, async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: /api/auth/register, /api/auth/login`);
  console.log(`👥 User endpoints: /api/users`);
});
