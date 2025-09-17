import sequelize from '../config/database.js';
import User from './User.js';
import { EmployerProfile } from './EmployerProfile.js';
import { CandidateProfile } from './CandidateProfile.js';
import { Experience } from './Experience.js';
import { Project } from './Project.js';
import { Education } from './Education.js';

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

// Export models and sequelize
export {
  sequelize,
  User,
  EmployerProfile,
  CandidateProfile,
  Experience,
  Project,
  Education,
};
