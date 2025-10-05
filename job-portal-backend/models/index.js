import sequelize from '../config/database.js';
import User from './User.js';
import { EmployerProfile } from './EmployerProfile.js';
import { CandidateProfile } from './CandidateProfile.js';
import { Experience } from './Experience.js';
import { Project } from './Project.js';
import { Education } from './Education.js';
import { EnhancedSkill } from './EnhancedSkill.js';
import { SkillEvidence } from './SkillEvidence.js';
import { PeerEndorsement } from './PeerEndorsement.js';
import { ReviewerInvitation } from './ReviewerInvitation.js';
import { TeamMember } from './TeamMember.js';
import Job from './Job.js';
import JobApplication from './JobApplication.js';
import SavedJob from './SavedJob.js';
import Otp from './Otp.js';

// Define associations
User.hasOne(EmployerProfile, { foreignKey: 'user_id', as: 'employerProfile' });
User.hasOne(CandidateProfile, { foreignKey: 'user_id', as: 'candidateProfile' });

EmployerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CandidateProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Experience, Project, and Education associations (only for candidates)
CandidateProfile.hasMany(Experience, { foreignKey: 'user_profile_id', as: 'experiences' });
CandidateProfile.hasMany(Project, { foreignKey: 'user_profile_id', as: 'projects' });
CandidateProfile.hasMany(Education, { foreignKey: 'user_profile_id', as: 'educations' });

Experience.belongsTo(CandidateProfile, { foreignKey: 'user_profile_id', as: 'candidateProfile' });
Project.belongsTo(CandidateProfile, { foreignKey: 'user_profile_id', as: 'candidateProfile' });
Education.belongsTo(CandidateProfile, { foreignKey: 'user_profile_id', as: 'candidateProfile' });

// Enhanced Skills associations
CandidateProfile.hasMany(EnhancedSkill, { foreignKey: 'candidate_profile_id', as: 'coreSkills' });
CandidateProfile.hasMany(ReviewerInvitation, { foreignKey: 'candidate_profile_id', as: 'reviewerInvitations' });

EnhancedSkill.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id', as: 'candidateProfile' });
EnhancedSkill.hasMany(SkillEvidence, { foreignKey: 'enhanced_skill_id', as: 'evidence' });
EnhancedSkill.hasMany(PeerEndorsement, { foreignKey: 'enhanced_skill_id', as: 'endorsements' });

SkillEvidence.belongsTo(EnhancedSkill, { foreignKey: 'enhanced_skill_id', as: 'enhancedSkill' });
PeerEndorsement.belongsTo(EnhancedSkill, { foreignKey: 'enhanced_skill_id', as: 'enhancedSkill' });
ReviewerInvitation.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id', as: 'candidateProfile' });

// Team Member associations
EmployerProfile.hasMany(TeamMember, { foreignKey: 'employer_profile_id', as: 'teamMembers' });
TeamMember.belongsTo(EmployerProfile, { foreignKey: 'employer_profile_id', as: 'employerProfile' });
TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(TeamMember, { foreignKey: 'user_id', as: 'teamMember' });

// Job associations
EmployerProfile.hasMany(Job, { foreignKey: 'employer_profile_id', as: 'jobs' });
Job.belongsTo(EmployerProfile, { foreignKey: 'employer_profile_id', as: 'employerProfile' });
Job.belongsTo(User, { foreignKey: 'posted_by', as: 'postedBy' });
User.hasMany(Job, { foreignKey: 'posted_by', as: 'postedJobs' });

// Job Application associations
Job.hasMany(JobApplication, { foreignKey: 'job_id', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobApplication.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });
JobApplication.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id', as: 'candidateProfile' });
JobApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
User.hasMany(JobApplication, { foreignKey: 'candidate_id', as: 'applications' });
CandidateProfile.hasMany(JobApplication, { foreignKey: 'candidate_profile_id', as: 'applications' });

// Saved Job associations
User.hasMany(SavedJob, { foreignKey: 'candidate_id', as: 'savedJobs' });
Job.hasMany(SavedJob, { foreignKey: 'job_id', as: 'savedByUsers' });
SavedJob.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });
SavedJob.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Export models and sequelize
export {
  sequelize,
  User,
  EmployerProfile,
  CandidateProfile,
  Experience,
  Project,
  Education,
  EnhancedSkill,
  SkillEvidence,
  PeerEndorsement,
  ReviewerInvitation,
  TeamMember,
  Job,
  JobApplication,
  SavedJob,
  Otp,
};
