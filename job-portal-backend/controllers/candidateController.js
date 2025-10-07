import { User, CandidateProfile, EnhancedSkill, Experience, Education, Project } from '../models/index.js'
import { Op } from 'sequelize'

// Get all candidates (for employers to browse)
const getCandidates = async (req, res) => {
  try {
    console.log('Fetching candidates...')
    console.log('User from token:', req.user)
    
    // First, let's get all candidate users without any includes to see if they exist
    const allUsers = await User.findAll({
      where: {
        role: 'candidate'
      }
    })
    
    console.log(`Found ${allUsers.length} users with candidate role`)
    console.log('Candidate users:', allUsers.map(u => ({ id: u.id, email: u.email, is_active: u.is_active })))
    
    // Now get active candidates
    const candidates = await User.findAll({
      where: {
        role: 'candidate',
        is_active: true
      },
      include: [
        {
          model: CandidateProfile,
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    console.log(`Found ${candidates.length} active candidates with profiles`)

    res.json({
      success: true,
      data: {
        candidates: candidates,
        pagination: {
          current_page: 1,
          per_page: candidates.length,
          total: candidates.length,
          total_pages: 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidates',
      details: error.message
    })
  }
}

// Get candidate profile by ID (for employers to view detailed profile)
const getCandidateProfile = async (req, res) => {
  try {
    const { id } = req.params

    const candidate = await User.findOne({
      where: {
        id,
        role: 'candidate',
        is_active: true
      },
      include: [
        {
          model: CandidateProfile,
          include: [
            {
              model: EnhancedSkill,
              as: 'coreSkills',
              required: false
            },
            {
              model: Experience,
              as: 'experiences',
              required: false,
              order: [['start_date', 'DESC']]
            },
            {
              model: Education,
              as: 'educations',
              required: false,
              order: [['graduation_year', 'DESC']]
            },
            {
              model: Project,
              as: 'projects',
              required: false,
              order: [['created_at', 'DESC']]
            }
          ]
        }
      ]
    })

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      })
    }

    res.json({
      success: true,
      data: {
        candidate
      }
    })
  } catch (error) {
    console.error('Error fetching candidate profile:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidate profile'
    })
  }
}

// Get candidate statistics (for employers dashboard)
const getCandidateStats = async (req, res) => {
  try {
    const totalCandidates = await User.count({
      where: {
        role: 'candidate',
        is_active: true
      }
    })

    const candidatesWithProfiles = await User.count({
      where: {
        role: 'candidate',
        is_active: true
      },
      include: [
        {
          model: CandidateProfile,
          required: true
        }
      ]
    })

    const recentCandidates = await User.count({
      where: {
        role: 'candidate',
        is_active: true,
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    res.json({
      success: true,
      data: {
        totalCandidates,
        candidatesWithProfiles,
        recentCandidates
      }
    })
  } catch (error) {
    console.error('Error fetching candidate stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidate statistics'
    })
  }
}

// Test endpoint to check database directly
const testCandidates = async (req, res) => {
  try {
    console.log('Testing candidates endpoint...')
    
    // Get all users regardless of role
    const allUsers = await User.findAll()
    console.log(`Total users in database: ${allUsers.length}`)
    
    // Get all candidate users
    const candidateUsers = await User.findAll({
      where: {
        role: 'candidate'
      }
    })
    console.log(`Users with candidate role: ${candidateUsers.length}`)
    
    // Get active candidate users
    const activeCandidates = await User.findAll({
      where: {
        role: 'candidate',
        is_active: true
      }
    })
    console.log(`Active candidate users: ${activeCandidates.length}`)
    
    res.json({
      success: true,
      data: {
        totalUsers: allUsers.length,
        candidateUsers: candidateUsers.length,
        activeCandidates: activeCandidates.length,
        allUsers: allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, is_active: u.is_active })),
        candidateUsers: candidateUsers.map(u => ({ id: u.id, email: u.email, role: u.role, is_active: u.is_active }))
      }
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    })
  }
}

export {
  getCandidates,
  getCandidateProfile,
  getCandidateStats,
  testCandidates
}
